import {createGlobalStyle} from "styled-components/macro";

export const GlobalStyle = createGlobalStyle`
  :root {
    background-color: var(--color-base-0);
    color: var(--color-text);
    color-scheme: light dark;
    font-family: Verdana, sans-serif;
    font-size: 14px;

    --color-base-0: hsl(222deg, 10%, 95%);
    --color-base-1: hsl(0, 0%, 100%);
    --color-text: hsl(0, 0%, 20%);
    --color-satisfied: hsl(120, 100%, 25%);
    --color-satisfied-bg: hsla(120deg, 100%, 25%, 0.15);
    --color-unsatisfied: hsl(0, 100%, 41%);
    --color-unsatisfied-bg: hsla(0, 100%, 41%, 0.1);
    --color-error: hsl(0, 75%, 45%);
    --color-allowed-values: #00a3d5;
    --color-mandatory: #d58a00;
    --color-optional: #8927ab;
    --color-selection-mode: #18c0af;
    --shape-card-border-radius: 10px;
    --size-card-padding: 1.5em;
    --shadow-card: 1.4px 1.7px 5.3px rgba(0, 0, 0, 0.028),
    4.7px 5.6px 17.9px rgba(0, 0, 0, 0.042),
    21px 25px 80px rgba(0, 0, 0, 0.07);
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --color-base-0: hsl(222deg, 20%, 9%);
      --color-base-1: hsl(0, 0%, 13%);
      --color-text: hsl(0, 0%, 91%);
      --color-error: hsl(0, 100%, 17%);
      --shadow-card: none;
    }
  }

  body {
    margin: 0;
  }

  input, select, button {
    font-size: inherit;
  }
`;