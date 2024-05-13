import {Eq, EqT, RA, Str, RR} from "@viamedici-spc/fp-ts-extensions";
import {deepEqual} from "fast-equals";
import {
    SessionContext,
    ConfigurationModelSource,
    DecisionsToRespect,
    globalAttributeIdEquals,
    AttributeRelations,
    IConfiguratorClient,
    AllowedInExplain,
    AllowedRulesInExplain,
    AllowedRulesInExplainType,
    globalConstraintIdEquals,
    AllowedRulesInExplainAll,
    AllowedRulesInExplainNone, AllowedRulesInExplainSpecific
} from "@viamedici-spc/configurator-ts";
import {match} from "ts-pattern";

const globalAttributeIdEq = Eq.fromEquals(globalAttributeIdEquals);
const globalConstraintIdEq = Eq.fromEquals(globalConstraintIdEquals);

// TODO: Later make sure that decisionsToRespect, usageRuleParameters should stay the same
//  (e.g. undefined shouldn't map {} later in the mapping). See ClientLib mapping pipelines
const usageRuleParametersEq = Eq.fromEquals<Record<string, string> | null>((x, y) => RR.getEq(Str.Eq).equals(x ?? {}, y ?? {}));

const decisionsToRespectEq = Eq.struct<DecisionsToRespect>({
    attributeId: globalAttributeIdEq,
    decisions: RA.getEq(globalAttributeIdEq)
});

const attributeRelationsEq = Eq.fromEquals<AttributeRelations | null>((x, y) => RA.getEq(decisionsToRespectEq).equals(x ?? [], y ?? []));

const allowedRulesInExplainAllEq = Eq.struct<AllowedRulesInExplainAll>({
    type: Str.Eq
});
const allowedRulesInExplainNoneEq = Eq.struct<AllowedRulesInExplainNone>({
    type: Str.Eq
});
const allowedRulesInExplainSpecificEq = Eq.struct<AllowedRulesInExplainSpecific>({
    type: Str.Eq,
    rules: RA.getEq(globalConstraintIdEq)
});
const allowedRulesInExplainEq = Eq.fromEquals<AllowedRulesInExplain>((x, y) =>
    match({x, y})
        .returnType<boolean>()
        .with({x: {type: AllowedRulesInExplainType.all}, y: {type: AllowedRulesInExplainType.all}}, ({x, y}) =>
            allowedRulesInExplainAllEq.equals(x, y))
        .with({x: {type: AllowedRulesInExplainType.none}, y: {type: AllowedRulesInExplainType.none}}, ({x, y}) =>
            allowedRulesInExplainNoneEq.equals(x, y))
        .with({x: {type: AllowedRulesInExplainType.specific}, y: {type: AllowedRulesInExplainType.specific}}, ({x, y}) =>
            allowedRulesInExplainSpecificEq.equals(x, y))
        .otherwise(() => false));

const allowedInExplainEq: EqT<AllowedInExplain> = Eq.struct<Required<AllowedInExplain>>({
    rules: Eq.eqNullable(allowedRulesInExplainEq)
});

export const sessionContextEq: EqT<SessionContext> = Eq.struct<Required<SessionContext>>({
    configurationModelSource: Eq.fromEquals<ConfigurationModelSource>((x, y) => deepEqual(x, y)),
    attributeRelations: attributeRelationsEq,
    usageRuleParameters: usageRuleParametersEq,
    allowedInExplain: Eq.eqNullable(allowedInExplainEq)
});

export const nullableSessionContextEq = Eq.eqNullable(sessionContextEq);

const configurationClientEq: EqT<IConfiguratorClient> = Eq.eqStrict;
export const nullableConfigurationClientEq = Eq.eqNullable(configurationClientEq);