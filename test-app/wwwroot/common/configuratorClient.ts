import * as config from "../config";
import {createClient} from "@viamedici-spc/configurator-ts";

export function createConfiguratorClient(accessToken: string) {
    return createClient({
        sessionHandler: {accessToken: accessToken},
        hcaEngineBaseUrl: config.hcaEngineEndpoint,
    });
}