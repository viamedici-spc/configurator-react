<div >
  <strong>Viamedici SPC</strong>
</div>

# configurator-react

[![npm version](https://img.shields.io/npm/v/@viamedici-spc/configurator-react)](https://www.npmjs.com/package/@viamedici-spc/configurator-react)
[![license](https://img.shields.io/npm/l/@viamedici-spc/configurator-react)](https://github.com/viamedici-spc/configurator-react/blob/main/LICENSE)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/viamedici-spc/configurator-react/main.yml?branch=main)](https://github.com/viamedici-spc/configurator-react/actions/workflows/main.yml?query=branch%3Amain)

## Introduction

This **React** library simplifies the process of building configurator web applications using the _Viamedici Headless
Configuration Engine_ (HCE).

It offers all the features of the HCE through strongly typed **hooks** and **logic components**, eliminating the need to
interact directly with the HCE's REST API.

This library is intended for use in a browser environment and is not compatible with server-side rendering.

## UI Framework Independence

The library is designed to be UI framework-agnostic, allowing you to use any UI framework or component library of your choice to build your
configurator application.

It provides powerful hooks and logic-only components that can be easily integrated into your styled components.

## Features

The library includes additional features that make it even easier to build a configurator.

For a complete list of features, please refer to the base library [configurator-ts](https://github.com/viamedici-spc/configurator-ts).

## Demo App

The [Demo App](https://github.com/viamedici-spc/configurator-react-demo) is a comprehensive showcase of the features provided by this library and the HCE. It demonstrates how to effectively integrate and utilize this library within a React-based Single Page Application (SPA).

## Getting Started

### 1. Install Package

This library supports both **ESM** and **CommonJS**.

   ```bash
npm install @viamedici-spc/configurator-react
yarn add @viamedici-spc/configurator-react
   ```

### 2. Create a Client

Set up the connection parameters for the HCE by creating a client.

```typescript
import {createClient} from "@viamedici-spc/configurator-ts";

const client = createClient({
    sessionHandler: {
        accessToken: "<your access token>",
    },
    hcaEngineBaseUrl: "https://spc.cloud.ceventis.de/hca/api/engine",
});
```

### 3. Define a Configuration Model

Define the Configuration Model you want to use.

```typescript
const configurationModelSource = {
    type: ConfigurationModelSourceType.Channel,
    deploymentName: "Car-Root",
    channel: "release",
} satisfies ConfigurationModelFromChannel;
```

### 4. Setup Configuration Component

Wrap the configuration area with the `Configuration` component as its root component.

This component manages the configuration state and provides a configuration context for all child components.

Use React’s Suspense feature to render configuration-related components only when the configuration is ready.

```tsx
<Configuration configuratorClient={configuratorClient}
               configurationModelSource={configurationModelSource}>
    <Suspense fallback={<span>Configuration loading …</span>}>
        <ConfigurationSuspender>
            <PaintingColorAttribute/>
        </ConfigurationSuspender>
    </Suspense>
</Configuration>
```

### 5. Create an Attribute Component

Now, create a component for the `PaintingColor` attribute of the _Configuration Model_.

This component displays the currently selected value of the attribute.

The button triggers a decision to select (include) the value Green.

```tsx
function PaintingColorAttribute() {
    const {attribute, makeDecision} = useChoiceAttribute({localId: "Painting Color"});
    const selectedValue = AttributeInterpreter.getSelectedChoiceValues(attribute)[0] ?? "<nothing>"

    return (
        <div>
            <div>
                Selected value: {selectedValue}
            </div>
            <button onClick={() => makeDecision("Green", ChoiceValueDecisionState.Included)}>
                Select Green
            </button>
        </div>
    )
}
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.