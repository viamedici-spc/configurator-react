import { createRoot } from 'react-dom/client';
import Configurator from "./configurator/Configurator";
import styled from "styled-components/macro";
import {GlobalStyle} from "./GlobalStyle";
import {Suspense} from "react";
import {Logger} from "@viamedici-spc/configurator-ts";

Logger.setLogLevel("debug");

const Root = styled.div`
  height: 100vh;
  padding-left: 1em;
  padding-right: 1em;
  padding-bottom: 1em;
  display: flex;
  justify-content: center;
  //justify-content: stretch;
`;

createRoot(document.getElementById("app-container"))
    .render((
        <>
            <GlobalStyle/>
            <Root>
                <Configurator/>
            </Root>
        </>
    ));