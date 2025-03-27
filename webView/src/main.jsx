import { createRoot } from 'react-dom/client'
import { HashRouter } from "react-router-dom";
import App from './App.jsx'
import './message/index.js'
import {
  provideVSCodeDesignSystem,
  vsCodePanels,
  vsCodePanelTab,
  vsCodePanelView,
  vsCodeButton,
} from "@vscode/webview-ui-toolkit";

provideVSCodeDesignSystem().register(
  vsCodePanels(),
  vsCodePanelTab(),
  vsCodePanelView(),
  vsCodeButton()
);


createRoot(document.getElementById("root")).render(
    <HashRouter>
      <App />
    </HashRouter>
);
