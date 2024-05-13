import React, {PropsWithChildren} from "react";
import {
    AttributeType,
    BooleanAttribute, ChoiceAttribute,
    Configuration, ConfigurationModelSourceType, NumericAttribute,
    IConfigurationSession, ConfigurationModelFromPackage, ComponentAttribute
} from "@viamedici-spc/configurator-ts";
import {ConfigurationContext, ConfigurationSessionContext} from "../../src/internal/contexts";

export function WrappingComponent(props: PropsWithChildren<{
    session: IConfigurationSession,
    configuration: Configuration
}>) {
    return (
        <ConfigurationSessionContext.Provider value={props.session}>
            <ConfigurationContext.Provider value={props.configuration}>
                {props.children}
            </ConfigurationContext.Provider>
        </ConfigurationSessionContext.Provider>
    );
}

export const choiceAttribute = {
    type: AttributeType.Choice,
    isSatisfied: false,
    canContributeToConfigurationSatisfaction: false,
    id: {localId: "A1"},
    cardinality: {
        lowerBound: 0,
        upperBound: 1
    },
    values: [
        {
            id: "V1",
            decision: null,
            possibleDecisionStates: []
        }
    ]
} as ChoiceAttribute;

export const numericAttribute = {
    id: {localId: "A1"},
    type: AttributeType.Numeric,
    isSatisfied: false,
    canContributeToConfigurationSatisfaction: false,
    range: {
        min: 1,
        max: 2
    },
    decimalPlaces: 0
} as NumericAttribute;

export const booleanAttribute = {
    id: {localId: "A1"},
    type: AttributeType.Boolean,
    isSatisfied: false,
    canContributeToConfigurationSatisfaction: false
} as BooleanAttribute;

export const componentAttribute = {
    id: {localId: "A1"},
    type: AttributeType.Component,
    isSatisfied: false,
    canContributeToConfigurationSatisfaction: false
} as ComponentAttribute;

export const emptyModel: ConfigurationModelFromPackage = {
    type: ConfigurationModelSourceType.Package,
    configurationModelPackage: {
        root: null,
        configurationModels: []
    }
};

export const modelWithOneAttribute: ConfigurationModelFromPackage = {
    type: ConfigurationModelSourceType.Package,
    configurationModelPackage: {
        root: "root",
        configurationModels: [
            {
                configurationModelId: "root",
                attributes: {
                    choiceAttributes: [
                        {
                            attributeId: "A1",
                            lowerBound: 0,
                            upperBound: 1,
                            choiceValues: [
                                {
                                    choiceValueId: "A1_C1"
                                }
                            ]
                        }
                    ]
                }
            }
        ]
    }
};