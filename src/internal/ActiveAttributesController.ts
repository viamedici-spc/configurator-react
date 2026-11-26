import {GlobalAttributeIdKeyBuilder, type Attribute, type GlobalAttributeId, type IConfigurationSession} from "@viamedici-spc/configurator-ts";

type ScopedDecisionRefreshState =
    | {readonly status: "idle" | "refreshing"}
    | {readonly status: "error"; readonly error: unknown};

type ActiveAttributesSession = IConfigurationSession & {
    getActiveAttributes(): ReadonlyArray<GlobalAttributeId> | null;
    setActiveAttributes(attributes: ReadonlyArray<GlobalAttributeId> | null): Promise<void>;
    getPendingOperationCount(): number;
    getScopedDecisionRefreshState?(): ScopedDecisionRefreshState;
    retryScopedDecisionRefresh?(): void;
    addPendingOperationsChangedListener(listener: () => void): {unsubscribe(): void};
};

function supportsActiveAttributes(session: IConfigurationSession | null): session is ActiveAttributesSession {
    const candidate = session as Partial<ActiveAttributesSession> | null;
    return typeof candidate?.getActiveAttributes === "function"
        && typeof candidate.setActiveAttributes === "function"
        && typeof candidate.getPendingOperationCount === "function"
        && typeof candidate.addPendingOperationsChangedListener === "function";
}

/** Trimmed domains cannot become selectable, regardless of visibility or decisions. */
export function isImmutablyExcluded(attribute?: Attribute): boolean {
    if (attribute?.type === "Boolean") {
        return attribute.isPossibleDecisionStatesImmutable === true && attribute.possibleDecisionStates.length === 0;
    }
    if (attribute?.type === "Component") {
        return attribute.isPossibleDecisionStatesImmutable === true &&
            attribute.possibleDecisionStates.length === 1 && attribute.possibleDecisionStates[0] === "Excluded";
    }
    if (attribute?.type === "Choice") {
        return attribute.values.size > 0 && [...attribute.values.values()].every(value =>
            value.isPossibleDecisionStatesImmutable === true &&
            value.possibleDecisionStates.length === 1 && value.possibleDecisionStates[0] === "Excluded");
    }
    return false;
}

export type ActiveAttributesState = {
    /** Last confirmed engine scope. Null means unrestricted; [] means no active attributes. */
    activeAttributes: readonly GlobalAttributeId[] | null;
    /** Latest requested scope, which may still be queued or in flight. */
    requestedAttributes: readonly GlobalAttributeId[] | null;
    enabled: boolean;
    isUpdating: boolean;
    /** A scope request is pending; ordinary decisions alone do not set this flag. */
    isScopeUpdating: boolean;
    isScopeSettled: boolean;
    isFullyPropagated: boolean;
    supported: boolean | undefined;
    error: unknown;
    scopedDecisionRefresh?: ScopedDecisionRefreshState;
};
/** One registry per Configuration provider. No viewport/tenant state is shared globally. */
export class ActiveAttributesController {
    private registrations = new Map<object, readonly GlobalAttributeId[]>();
    private fullScopes = new Set<object>();
    private waiters = new Set<(error: Error) => void>();
    private listeners = new Set<() => void>();
    private session: IConfigurationSession | null = null;
    private context: unknown;
    private unsubscribeSession?: () => void;
    private enabled = false;
    private scheduled = false;
    private running = false;
    private disposed = false;
    private generation = 0;
    private applied = "all";
    private activeAttributes: readonly GlobalAttributeId[] | null = null;
    private uncertain = false;
    private appliedAny = false;
    private supported: boolean | undefined;
    private error: unknown = null;
    private snapshot: ActiveAttributesState = {activeAttributes:null,requestedAttributes:null,enabled:false,isUpdating:false,isScopeUpdating:false,isScopeSettled:false,isFullyPropagated:false,supported:undefined,error:null};
    subscribe = (listener: () => void) => {this.listeners.add(listener); return () => {this.listeners.delete(listener);};};
    getSnapshot = () => this.snapshot;
    setSession(session: IConfigurationSession | null, context?: unknown) {
        this.disposed = false;
        if (session === this.session && context === this.context) return;
        for(const fail of this.waiters)fail(new Error("Configuration changed before full propagation completed."));
        this.unsubscribeSession?.();
        this.session = session; this.context = context; this.generation++;
        const activeSession = supportsActiveAttributes(session) ? session : null;
        this.unsubscribeSession = activeSession?.addPendingOperationsChangedListener(() => this.changed()).unsubscribe;
        this.activeAttributes = activeSession?.getActiveAttributes() ?? null;
        this.applied = this.key(this.activeAttributes);
        this.error = null; this.uncertain = false; this.appliedAny = this.applied !== "all"; this.supported = session && !activeSession ? false : undefined;
        this.changed();
    }
    setEnabled(enabled: boolean) {if (enabled === this.enabled) return; this.enabled = enabled; if(enabled && supportsActiveAttributes(this.session))this.supported=undefined; this.error = null; this.changed();}
    register(token: object, id: GlobalAttributeId) {
        return this.registerMany(token, [id]);
    }
    registerMany(token: object, ids: readonly GlobalAttributeId[]) {
        this.registrations.set(token, structuredClone(ids)); this.changed();
        return () => {this.registrations.delete(token); this.changed();};
    }
    requestFull(token: object, full: boolean) {
        if (full) this.fullScopes.add(token); else this.fullScopes.delete(token);
        this.changed();
        return () => {this.fullScopes.delete(token); this.changed();};
    }
    retry = () => {if(!supportsActiveAttributes(this.session))return;this.error = null; this.supported = undefined; this.uncertain = true; this.changed();};
    retryScopedDecisionRefresh = () => {if (supportsActiveAttributes(this.session)) this.session.retryScopedDecisionRefresh?.();};
    withFullPropagation = async <T,>(work: () => Promise<T>): Promise<T> => {
        const token = {};
        this.fullScopes.add(token); this.changed();
        try {
            await new Promise<void>((resolve,reject) => {
                let unsubscribe = () => {};
                const finish = (error?: unknown) => {unsubscribe();this.waiters.delete(fail);error?reject(error):resolve();};
                const fail = (error: Error) => finish(error);
                const check = () => {const state=this.getSnapshot();if(state.error)finish(state.error);else if(state.isFullyPropagated)finish();};
                this.waiters.add(fail);unsubscribe=this.subscribe(check);check();
            });
            return await work();
        } finally {this.fullScopes.delete(token);this.changed();}
    };
    dispose() {for(const fail of this.waiters)fail(new Error("Configuration closed."));this.unsubscribeSession?.(); this.disposed = true; this.generation++; this.session = null;}
    private desired(): readonly GlobalAttributeId[] | null {
        if (!this.enabled || this.fullScopes.size || this.supported === false && !this.appliedAny) return null;
        let known: ReadonlyMap<string, Attribute> | undefined;
        try {known = this.session?.getConfiguration().attributes;} catch { /* Closing/replacing the session. */ }
        const unique = new Map<string, GlobalAttributeId>();
        for (const ids of this.registrations.values()) {
            for (const id of ids) {
                const key = GlobalAttributeIdKeyBuilder(id);
                if ((!known || known.has(key)) && !isImmutablyExcluded(known?.get(key))) unique.set(key, id);
            }
        }
        return [...unique.entries()].sort(([a],[b]) => a.localeCompare(b)).map(([,id]) => id);
    }
    private key(ids: readonly GlobalAttributeId[] | null) {return ids === null ? "all" : JSON.stringify(ids.map(GlobalAttributeIdKeyBuilder).sort());}
    private emit() {
        if (this.disposed) return;
        const requested = this.desired(), desired = this.key(requested);
        // Stable references are required by useSyncExternalStore. Duplicate
        // registrations and pending-operation notifications must not churn the UI.
        const requestedAttributes = desired === this.key(this.snapshot.requestedAttributes) ? this.snapshot.requestedAttributes : requested;
        const scopePending = !!this.session && (this.running || this.uncertain || desired !== this.applied);
        const pending = scopePending || supportsActiveAttributes(this.session) && this.session.getPendingOperationCount() > 0;
        const settled = !!this.session && !pending && !this.error;
        const next = {activeAttributes:this.activeAttributes,requestedAttributes,enabled:this.enabled && this.supported !== false,isUpdating:pending && !this.error,isScopeUpdating:scopePending && !this.error,isScopeSettled:settled,isFullyPropagated:settled && desired === "all",supported:this.supported,error:this.error,
            scopedDecisionRefresh: supportsActiveAttributes(this.session) ? this.session.getScopedDecisionRefreshState?.() : undefined};
        if (Object.keys(next).some(key => next[key as keyof typeof next] !== this.snapshot[key as keyof ActiveAttributesState])) {
            this.snapshot = next; for (const listener of this.listeners) listener();
        }
    }
    private changed() {
        if (this.disposed) return;
        this.emit();
        if (this.scheduled || this.running) return;
        this.scheduled = true;
        queueMicrotask(() => {this.scheduled = false; void this.pump();});
    }
    private async pump() {
        if (this.running || this.disposed || !this.session || this.error) return;
        this.running = true;
        try {
            while (!this.disposed && supportsActiveAttributes(this.session) && !this.error) {
                const desired = this.desired(), key = this.key(desired);
                if (key === this.applied && !this.uncertain) break;
                const session = this.session, generation = this.generation, wasUncertain = this.uncertain;
                this.uncertain = true; this.emit();
                try {
                    await session.setActiveAttributes(desired);
                    if (generation !== this.generation) continue;
                    this.applied = key; this.uncertain = false; this.supported = true;
                    this.activeAttributes = desired;
                    this.appliedAny ||= desired !== null;
                } catch (error) {
                    if (generation !== this.generation) continue;
                    if ((error as {activeAttributesUnsupported?: boolean} | null)?.activeAttributesUnsupported) {
                        // A prior or ambiguous request may have restricted the engine.
                        // Reinitializing with the existing context creates an unrestricted
                        // session and migrates decisions, without replaying the old AA set.
                        if (this.appliedAny || wasUncertain) {
                            try {await session.setSessionContext(session.getSessionContext());}
                            catch (recoveryError) {
                                if (generation !== this.generation) continue;
                                this.error = recoveryError;
                                break;
                            }
                            if (generation !== this.generation) continue;
                            if (session.getActiveAttributes() !== null) {
                                this.error = new Error("The restarted session still has an active-attribute restriction.");
                                break;
                            }
                        }
                        this.supported = false; this.uncertain = false; this.applied = "all";
                        this.activeAttributes = null; this.appliedAny = false;
                    } else this.error = error;
                }
            }
        } finally {this.running = false; this.emit();}
    }
}
