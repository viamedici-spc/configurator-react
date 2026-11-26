import {createContext, forwardRef, useContext, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, type ComponentPropsWithoutRef, type PropsWithChildren} from "react";
import {useSyncExternalStore} from "use-sync-external-store/shim";
import {useAtomValue} from "jotai";
import {GlobalAttributeIdKeyBuilder, globalAttributeIdEq, type GlobalAttributeId} from "@viamedici-spc/configurator-ts";
import {getEq} from "fp-ts/ReadonlyArray";
import {useStableMemo} from "fp-ts-react-stable-hooks";
import {useAtomsContext, useConfiguratorStore} from "../internal/contexts";
import {ActiveAttributesController} from "../internal/ActiveAttributesController";
const ActiveContext = createContext<ActiveAttributesController | null>(null);
export function ActiveAttributesProvider({enabled, children}: PropsWithChildren<{enabled:boolean}>) {
    const atoms = useAtomsContext(), store = useConfiguratorStore();
    const session = useAtomValue(atoms.selectors.configurationSessionAtom, {store});
    const updating = useAtomValue(atoms.selectors.sessionUpdatingAtom, {store});
    const controller = useMemo(() => new ActiveAttributesController(), []);
    let context: unknown = null, liveSession = session;
    try {context = session?.getSessionContext();} catch {liveSession = null;}
    useLayoutEffect(() => {controller.setSession(liveSession, context);}, [controller,liveSession,context,updating.isUpdating]);
    useLayoutEffect(() => {controller.setEnabled(enabled);}, [controller,enabled]);
    useEffect(() => () => controller.dispose(), [controller]);
    return <ActiveContext.Provider value={controller}>{children}</ActiveContext.Provider>;
}
function useController() {const controller = useContext(ActiveContext);if (!controller) throw new Error("Active attributes require a Configuration provider.");return controller;}
/** Registers a rendered attribute. Duplicate copies (e.g. favorites) count once. */
export function useActiveAttribute(id: GlobalAttributeId, rendered = true) {
    const controller = useController(), token = useRef({}).current, key = GlobalAttributeIdKeyBuilder(id);
    useLayoutEffect(() => rendered ? controller.register(token, id) : undefined, [controller,token,key,rendered]);
}

export function useRegisterActiveAttributes(ids: readonly GlobalAttributeId[], active: boolean) {
    const controller = useController();
    const token = useRef({}).current;
    const stableIds = useStableMemo(() => ids, ids, getEq(globalAttributeIdEq));
    useLayoutEffect(() => active && stableIds.length > 0 ? controller.registerMany(token, stableIds) : undefined,
        [controller, token, stableIds, active]);
}
/** Request unrestricted propagation while the supplied condition is true. */
export function useFullPropagation(full: boolean) {
    const controller = useController(), token = useRef({}).current;
    useLayoutEffect(() => controller.requestFull(token, full), [controller,token,full]);
}

export type ConfigurationResultsSectionProps = ComponentPropsWithoutRef<"section"> & {
    /** Use mounted mode for results that are rendered only on their own step. */
    when?: "visible" | "mounted";
    /** Set false when this section belongs to an inactive view that stays mounted. */
    active?: boolean;
};

/** Render a section that requests unrestricted propagation for its visible lifetime. */
export const ConfigurationResultsSection = forwardRef<HTMLElement, ConfigurationResultsSectionProps>(function ConfigurationResultsSection(
    {when = "visible", active = true, hidden, ...props}, forwardedRef
) {
    const controller = useController();
    const sectionRef = useRef<HTMLElement>(null);
    useImperativeHandle(forwardedRef, () => sectionRef.current!, []);

    useLayoutEffect(() => {
        const section = sectionRef.current;
        if (!active || hidden || !section) return;
        const token = {};
        if (when === "mounted") return controller.requestFull(token, true);

        let stopped = false;
        let release: (() => void) | undefined;
        const stopObserving = observeSectionVisibility(section, visible => {
            if (stopped || visible === !!release) return;
            if (visible) {
                release = controller.requestFull(token, true);
            } else {
                release?.();
                release = undefined;
            }
        });
        return () => {
            stopped = true;
            stopObserving?.();
            release?.();
        };
    }, [controller, active, hidden, when]);

    return <section {...props} hidden={hidden} ref={sectionRef}/>;
});

function observeSectionVisibility(section: HTMLElement, onChange: (visible: boolean) => void) {
    const view = section.ownerDocument.defaultView;
    if (!view) return;
    if (typeof view.IntersectionObserver !== "undefined") {
        const observer = new view.IntersectionObserver(entries => {
            const entry = entries[entries.length - 1];
            if (entry) onChange(entry.isIntersecting && entry.intersectionRatio > 0);
        }, {rootMargin: "0px", threshold: [0, 0.001]});
        observer.observe(section);
        return () => observer.disconnect();
    }

    const check = () => {
        const bounds = section.getBoundingClientRect();
        onChange(bounds.width > 0 && bounds.height > 0 && bounds.bottom > 0 &&
            bounds.top < view.innerHeight && bounds.right > 0 && bounds.left < view.innerWidth);
    };
    check();
    view.addEventListener("scroll", check, true);
    view.addEventListener("resize", check);
    return () => {
        view.removeEventListener("scroll", check, true);
        view.removeEventListener("resize", check);
    };
}

export function useActiveAttributes() {
    const controller = useController();
    const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
    return {...state, retry:controller.retry, retryScopedDecisionRefresh:controller.retryScopedDecisionRefresh,
        withFullPropagation:controller.withFullPropagation, getCurrentState:controller.getSnapshot};
}
