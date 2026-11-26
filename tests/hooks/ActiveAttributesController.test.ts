import {assert, expect, test} from 'vitest';
import {GlobalAttributeIdKeyBuilder,type GlobalAttributeId,type IConfigurationSession} from '@viamedici-spc/configurator-ts';
import {ActiveAttributesController} from '../../src/internal/ActiveAttributesController';
const tick=()=>new Promise<void>(resolve=>setTimeout(resolve, 0));
const A={localId:'A'},B={localId:'B'},child={localId:'A',componentPath:['Wheel'],sharedConfigurationModelId:'Context'};
function fixture(){
 let active:readonly GlobalAttributeId[]|null=null,pending=0,hold=false,fail:unknown=null,gate=Promise.resolve(),release=()=>{},restarts=0,restartFailure:unknown=null,restartHeld=false;const context={model:'unchanged'};
 const calls:Array<readonly GlobalAttributeId[]|null>=[],listeners=new Set<()=>void>(),attributes=new Map<string,any>([A,B,child].map(id=>[GlobalAttributeIdKeyBuilder(id),{}]));
 const notify=()=>{for(const listener of listeners)listener();};
 const session={getSessionContext:()=>context,setSessionContext:async(next:unknown)=>{assert.strictEqual(next,context);restarts++;pending++;notify();try{if(restartHeld){restartHeld=false;await gate;}if(restartFailure)throw restartFailure;active=null;}finally{pending--;notify();}},getConfiguration:()=>({attributes}),getActiveAttributes:()=>active,getPendingOperationCount:()=>pending,addPendingOperationsChangedListener:(listener:()=>void)=>{listeners.add(listener);return {unsubscribe:()=>{listeners.delete(listener);}};},setActiveAttributes:async(ids:readonly GlobalAttributeId[]|null)=>{calls.push(ids);pending++;notify();try{if(hold){hold=false;await gate;}if(fail){const error=fail;fail=null;throw error;}active=ids;}finally{pending--;notify();}}} as unknown as IConfigurationSession;
 const controller=new ActiveAttributesController();controller.setSession(session,{});controller.setEnabled(true);
 return {controller,session,calls,attributes,restarts:()=>restarts,failRestart(error:unknown){restartFailure=error;},holdRestart(){restartHeld=true;gate=new Promise<void>(resolve=>{release=resolve;});},hold(){hold=true;gate=new Promise<void>(resolve=>{release=resolve;});},release(){release();},fail(error:unknown){fail=error;},pending(value:number){pending=value;notify();}};
}
test('rendered registrations batch and deduplicate favorites by the full component/shared attribute path',async()=>{
 const f=fixture();try{const removeFirst=f.controller.register({},A),removeCopy=f.controller.register({},A);f.controller.register({},child);await tick();assert.strictEqual(f.calls.length,1);assert.strictEqual(f.calls[0]!.length,2);assert.deepEqual(new Set(f.calls[0]!.map(GlobalAttributeIdKeyBuilder)),new Set([A,child].map(GlobalAttributeIdKeyBuilder)));removeFirst();await tick();assert.strictEqual(f.calls.length,1,'Removing one favorite copy must keep the other active.');removeCopy();await tick();assert.deepEqual(f.calls[1],[child]);assert.strictEqual(f.controller.getSnapshot().isScopeSettled,true);assert.strictEqual(f.controller.getSnapshot().isFullyPropagated,false);}finally{f.controller.dispose();}
});
test('rapid visibility changes keep values mounted and send only the latest target after the running request',async()=>{
 const f=fixture();try{f.hold();const removeA=f.controller.register({},A);await tick();removeA();const removeB=f.controller.register({},B);removeB();f.controller.register({},child);await tick();assert.strictEqual(f.calls.length,1);assert.strictEqual(f.controller.getSnapshot().isUpdating,true);f.release();await tick();assert.strictEqual(f.calls.length,2);assert.deepEqual(f.calls[1],[child]);assert.strictEqual(f.controller.getSnapshot().isScopeSettled,true);}finally{f.release();f.controller.dispose();}
});
test('disabling active attributes clears the restriction, and enabling reapplies the rendered set without a session restart',async()=>{
 const f=fixture();try{f.controller.register({},A);await tick();f.hold();f.controller.setEnabled(false);await tick();assert.strictEqual(f.calls.slice(-1)[0],null,'Full propagation uses DELETE semantics, not an empty active set.');assert.strictEqual(f.controller.getSnapshot().isFullyPropagated,false);f.release();await tick();assert.strictEqual(f.controller.getSnapshot().isFullyPropagated,true);assert.strictEqual(f.controller.getSnapshot().enabled,false);f.controller.setEnabled(true);await tick();assert.deepEqual(f.calls.slice(-1)[0],[A]);assert.strictEqual(f.controller.getSnapshot().isScopeSettled,true);}finally{f.release();f.controller.dispose();}
});
test('last-step and temporary full scopes are reference counted and wait for full propagation plus queued decisions',async()=>{
 const f=fixture();try{f.controller.register({},A);await tick();f.hold();let explained=false;const explanation=f.controller.withFullPropagation(async()=>{explained=true;return 'answer';});await tick();assert.strictEqual(explained,false);assert.strictEqual(f.calls.slice(-1)[0],null);f.release();assert.strictEqual(await explanation,'answer');await tick();assert.deepEqual(f.calls.slice(-1)[0],[A]);const releaseLastStep=f.controller.requestFull({},true);await tick();assert.strictEqual(f.controller.getSnapshot().isFullyPropagated,true);f.pending(1);assert.strictEqual(f.controller.getSnapshot().isFullyPropagated,false);assert.strictEqual(f.controller.getSnapshot().isScopeSettled,false);f.pending(0);assert.strictEqual(f.controller.getSnapshot().isFullyPropagated,true);releaseLastStep();await tick();assert.deepEqual(f.calls.slice(-1)[0],[A]);}finally{f.release();f.controller.dispose();}
});
test('an ambiguous failed POST cannot be treated as fully propagated when AA is disabled; retry explicitly clears it',async()=>{
 const f=fixture();try{f.fail(new Error('connection lost'));f.controller.register({},A);await tick();assert.match(String(f.controller.getSnapshot().error),/connection lost/);assert.strictEqual(f.controller.getSnapshot().isFullyPropagated,false);f.hold();f.controller.setEnabled(false);await tick();assert.strictEqual(f.calls.slice(-1)[0],null);assert.strictEqual(f.controller.getSnapshot().isFullyPropagated,false);f.release();await tick();assert.strictEqual(f.controller.getSnapshot().isFullyPropagated,true);f.controller.setEnabled(true);f.fail(new Error('temporary'));await tick();assert.isOk(f.controller.getSnapshot().error);f.controller.retry();await tick();assert.strictEqual(f.controller.getSnapshot().error,null);assert.strictEqual(f.controller.getSnapshot().isScopeSettled,true);}finally{f.release();f.controller.dispose();}
});
test('unsupported operations use full propagation, restarting first when a restriction was already applied',async()=>{
 for(const previouslyApplied of [false,true]){const f=fixture();try{f.controller.register({},A);if(previouslyApplied){await tick();f.fail({activeAttributesUnsupported:true});f.controller.setEnabled(false);}else f.fail({activeAttributesUnsupported:true});await tick();assert.strictEqual(f.controller.getSnapshot().error,null);assert.strictEqual(f.controller.getSnapshot().supported,false);assert.strictEqual(f.controller.getSnapshot().enabled,false);assert.strictEqual(f.controller.getSnapshot().isFullyPropagated,true);assert.strictEqual(f.restarts(),previouslyApplied?1:0);const count=f.calls.length;f.controller.register({},B);await tick();assert.strictEqual(f.calls.length,count,'compatibility fallback must not loop on new rendered inputs');}finally{f.controller.dispose();}}
});
test('a failed or pending unrestricted restart never claims full propagation',async()=>{
 for(const fail of [false,true]){const f=fixture();try{f.controller.register({},A);await tick();f.fail({activeAttributesUnsupported:true});if(fail)f.failRestart(new Error('restart failed'));else f.holdRestart();f.controller.setEnabled(false);await tick();assert.strictEqual(f.controller.getSnapshot().isFullyPropagated,false);assert.deepEqual(f.controller.getSnapshot().activeAttributes,[A]);if(fail)assert.match(String(f.controller.getSnapshot().error),/restart failed/);else{f.release();await tick();assert.strictEqual(f.controller.getSnapshot().isFullyPropagated,true);}}finally{f.release();f.controller.dispose();}}
});
test('an ambiguous earlier POST requires a fresh session even when no restriction was confirmed',async()=>{
 const f=fixture();try{f.fail(new Error('response lost'));f.controller.register({},A);await tick();f.fail({activeAttributesUnsupported:true});f.controller.setEnabled(false);await tick();assert.strictEqual(f.restarts(),1);assert.strictEqual(f.controller.getSnapshot().isFullyPropagated,true);}finally{f.controller.dispose();}
});
test('a late compatibility restart cannot overwrite a replacement session scope',async()=>{
 const f=fixture(),next=fixture();next.controller.dispose();try{f.controller.register({},A);await tick();f.fail({activeAttributesUnsupported:true});f.holdRestart();f.controller.register({},B);await tick();f.controller.setSession(next.session,{});f.release();await tick();assert.strictEqual(f.controller.getSnapshot().supported,true);assert.deepEqual(next.calls.slice(-1)[0],[A,B]);assert.strictEqual(f.controller.getSnapshot().isFullyPropagated,false);}finally{f.release();f.controller.dispose();}
});

test('model/session replacement ignores late results, reapplies current registrations, and cancels captures for old sessions',async()=>{
 const f=fixture(),next=fixture();try{next.controller.dispose();f.controller.register({},A);await tick();f.hold();const capture=f.controller.withFullPropagation(async()=>assert.fail('Old capture must not run.'));const rejected=expect(capture).rejects.toThrow(/Configuration changed/);await tick();f.controller.setSession(next.session,{});await rejected;f.release();await tick();assert.strictEqual(f.controller.getSnapshot().isScopeSettled,true);assert.deepEqual(next.calls.slice(-1)[0],[A]);assert.strictEqual(f.controller.getSnapshot().isFullyPropagated,false);f.hold();const closed=f.controller.withFullPropagation(async()=>{});const closedRejection=expect(closed).rejects.toThrow(/closed/);f.controller.dispose();await closedRejection;}finally{f.release();f.controller.dispose();}
});
test('scope inspection separates confirmed and requested full-path sets, including empty and unrestricted scopes',async()=>{
 const f=fixture();try{
  const removeA=f.controller.register({},A);f.controller.register({},child);await tick();
  assert.deepEqual(new Set(f.controller.getSnapshot().activeAttributes!.map(GlobalAttributeIdKeyBuilder)),new Set([A,child].map(GlobalAttributeIdKeyBuilder)));
  f.hold();removeA();await tick();
  let state=f.controller.getSnapshot();assert.strictEqual(state.activeAttributes!.length,2);assert.deepEqual(state.requestedAttributes,[child]);assert.strictEqual(state.isUpdating,true);
  f.release();await tick();assert.deepEqual(f.controller.getSnapshot().activeAttributes,[child]);
  f.hold();f.controller.setEnabled(false);await tick();state=f.controller.getSnapshot();assert.deepEqual(state.activeAttributes,[child]);assert.strictEqual(state.requestedAttributes,null);
  f.release();await tick();assert.strictEqual(f.controller.getSnapshot().activeAttributes,null);
  const empty=fixture();try{await tick();assert.deepEqual(empty.controller.getSnapshot().activeAttributes,[]);assert.deepEqual(empty.controller.getSnapshot().requestedAttributes,[]);}finally{empty.controller.dispose();}
 }finally{f.release();f.controller.dispose();}
});
test('failed updates keep the last confirmed scope, and duplicate registrations do not churn inspector snapshots',async()=>{
 const f=fixture();try{
  f.controller.register({},A);await tick();const before=f.controller.getSnapshot();let notifications=0;const unsubscribe=f.controller.subscribe(()=>notifications++);
  const removeCopy=f.controller.register({},A);await tick();removeCopy();await tick();assert.strictEqual(f.controller.getSnapshot(),before);assert.strictEqual(notifications,0);
  f.fail(new Error('failed scope update'));f.controller.register({},child);await tick();
  const state=f.controller.getSnapshot();assert.deepEqual(state.activeAttributes,[A]);assert.strictEqual(state.requestedAttributes!.length,2);assert.match(String(state.error),/failed scope/);unsubscribe();
 }finally{f.controller.dispose();}
});
test('ordinary pending decisions do not update the scope or label it as a scope request',async()=>{
 const f=fixture();try{f.controller.register({},A);await tick();const before=f.calls.length;f.pending(1);assert.strictEqual(f.controller.getSnapshot().isUpdating,true);assert.strictEqual(f.controller.getSnapshot().isScopeUpdating,false);assert.strictEqual(f.controller.getSnapshot().isScopeSettled,false);const remove=f.controller.register({},A);await tick();remove();f.pending(0);await tick();assert.strictEqual(f.calls.length,before);assert.strictEqual(f.controller.getSnapshot().isScopeSettled,true);}finally{f.controller.dispose();}
});

const excludedDomain={isPossibleDecisionStatesImmutable:true,possibleDecisionStates:['Excluded']};
const choiceDomain=(...values:any[])=>({type:'Choice',values:new Map(values.map((value,index)=>[String(index),value]))});
test('immutable excluded components and choices never enter rendered, favorite or Explain scopes',async()=>{
 const f=fixture();try{
  f.attributes.set(GlobalAttributeIdKeyBuilder(A),{type:'Component',...excludedDomain});
  f.attributes.set(GlobalAttributeIdKeyBuilder(child),choiceDomain(excludedDomain,excludedDomain));
  f.controller.register({},A);f.controller.register({},A);f.controller.register({},child);f.controller.register({},child);f.controller.register({},B);
  await tick();assert.deepEqual(f.calls,[ [B] ]);assert.deepEqual(f.controller.getSnapshot().requestedAttributes,[B]);assert.deepEqual(f.controller.getSnapshot().activeAttributes,[B]);
 }finally{f.controller.dispose();}
});
test('only-excluded immutable domains send an empty scoped set, never unrestricted propagation',async()=>{
 const f=fixture();try{
  f.attributes.set(GlobalAttributeIdKeyBuilder(A),choiceDomain(excludedDomain));f.controller.register({},A);await tick();
  assert.deepEqual(f.calls,[[]]);assert.strictEqual(f.controller.getSnapshot().isFullyPropagated,false);assert.strictEqual(f.controller.getSnapshot().isScopeSettled,true);
  f.controller.setEnabled(false);await tick();assert.strictEqual(f.calls.slice(-1)[0],null);
 }finally{f.controller.dispose();}
});
test('mutable blocked and immutable included domains remain eligible for AA',async()=>{
 const domains=[
  {type:'Component',...excludedDomain,isPossibleDecisionStatesImmutable:false},
  {type:'Component',...excludedDomain,possibleDecisionStates:['Included']},
  {type:'Component',...excludedDomain,possibleDecisionStates:['Included','Excluded']},
  choiceDomain({...excludedDomain,isPossibleDecisionStatesImmutable:false}),
  choiceDomain(excludedDomain,{...excludedDomain,possibleDecisionStates:['Included']}),
  choiceDomain({...excludedDomain,possibleDecisionStates:['Included','Excluded']}),
  {type:'Boolean',isPossibleDecisionStatesImmutable:true,possibleDecisionStates:[false]},
  {type:'Numeric',isPossibleDecisionStatesImmutable:true,range:{min:0,max:0}},
  choiceDomain(),choiceDomain({possibleDecisionStates:['Excluded']}),choiceDomain({...excludedDomain,possibleDecisionStates:[]})
 ];
 for(const domain of domains){const f=fixture();try{f.attributes.set(GlobalAttributeIdKeyBuilder(A),domain);f.controller.register({},A);await tick();assert.deepEqual(f.calls,[[A]],JSON.stringify(domain));}finally{f.controller.dispose();}}
});
test('filtering checks the exact shared/component path and does not infer exclusion from a parent',async()=>{
 const f=fixture();try{
  f.attributes.set(GlobalAttributeIdKeyBuilder(A),{type:'Component',...excludedDomain});
  f.controller.register({},A);f.controller.register({},child);await tick();assert.deepEqual(f.calls,[[child]]);
 }finally{f.controller.dispose();}
});
test('new immutable domains remove mounted registrations after a decision without remounting controls',async()=>{
 const f=fixture();try{
  f.controller.register({},A);await tick();assert.deepEqual(f.calls,[[A]]);f.pending(1);
  f.attributes.set(GlobalAttributeIdKeyBuilder(A),choiceDomain(excludedDomain));f.pending(0);await tick();
  assert.deepEqual(f.calls,[[A],[]]);assert.deepEqual(f.controller.getSnapshot().activeAttributes,[]);const count=f.calls.length;
  f.pending(1);f.pending(0);await tick();assert.strictEqual(f.calls.length,count,'Unchanged domains do not resend AA after decisions.');
  f.attributes.set(GlobalAttributeIdKeyBuilder(A),choiceDomain({...excludedDomain,possibleDecisionStates:['Included','Excluded']}));f.pending(0);await tick();assert.deepEqual(f.calls.slice(-1)[0],[A]);
 }finally{f.controller.dispose();}
});
test('full Results preserves unrestricted propagation and returning to inputs restores the filtered scope',async()=>{
 const f=fixture();try{
  f.attributes.set(GlobalAttributeIdKeyBuilder(A),choiceDomain(excludedDomain));f.controller.register({},A);f.controller.register({},B);await tick();
  const release=f.controller.requestFull({},true);await tick();assert.strictEqual(f.calls.slice(-1)[0],null);assert.strictEqual(f.controller.getSnapshot().isFullyPropagated,true);
  release();await tick();assert.deepEqual(f.calls.slice(-1)[0],[B]);
 }finally{f.controller.dispose();}
});
test('model replacement recomputes immutable exclusions from the new session domains',async()=>{
 const f=fixture(),next=fixture();next.controller.dispose();try{
  f.controller.register({},A);await tick();next.attributes.set(GlobalAttributeIdKeyBuilder(A),{type:'Component',...excludedDomain});
  f.controller.setSession(next.session,{});await tick();assert.deepEqual(next.calls,[[]]);assert.deepEqual(f.controller.getSnapshot().activeAttributes,[]);
 }finally{f.controller.dispose();}
});
test('an in-flight AA response cannot leave a newly immutable exclusion active',async()=>{
 const f=fixture();try{
  f.hold();f.controller.register({},A);await tick();assert.deepEqual(f.calls,[[A]]);
  f.attributes.set(GlobalAttributeIdKeyBuilder(A),choiceDomain(excludedDomain));f.release();await tick();
  assert.deepEqual(f.calls,[[A],[]]);assert.deepEqual(f.controller.getSnapshot().activeAttributes,[]);assert.strictEqual(f.controller.getSnapshot().isScopeSettled,true);
 }finally{f.release();f.controller.dispose();}
});

test('an older client leaves active attributes unavailable and propagation unrestricted', async () => {
    const controller = new ActiveAttributesController();
    try {
        controller.setSession({getConfiguration: () => ({attributes: new Map()})} as unknown as IConfigurationSession);
        controller.setEnabled(true);
        controller.register({}, A);
        controller.retry();
        await tick();
        assert.strictEqual(controller.getSnapshot().supported, false);
        assert.strictEqual(controller.getSnapshot().isFullyPropagated, true);
        assert.strictEqual(controller.getSnapshot().error, null);
    } finally {
        controller.dispose();
    }
});
