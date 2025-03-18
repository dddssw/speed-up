import './content.css'
import {useState} from 'react'
export default function Content(){
    return (
      <>
        <div className="contain">
          <vscode-panels aria-label="With Badge">
            <vscode-panel-tab id="tab-1">
              HOOKS
              <vscode-badge appearance="secondary">1</vscode-badge>
            </vscode-panel-tab>
            <vscode-panel-tab id="tab-2">
              UTILS
              <vscode-badge appearance="secondary">1</vscode-badge>
            </vscode-panel-tab>
            <vscode-panel-view id="view-1">
                <div>
              <h2>Manage Your Hooks</h2>
              <Manager></Manager>
                </div>
            </vscode-panel-view>
            <vscode-panel-view id="view-2">
              <h2>Manage Your Utils</h2>
            </vscode-panel-view>
          </vscode-panels>
        </div>
      </>
    );
}
function Manager() {
  // 使用 useState 来管理 hooks 的状态
  const [hooks, setHooks] = useState([]);
  const [newHook, setNewHook] = useState("");

  // 处理输入框的变化
  const handleInputChange = (e) => {
    setNewHook(e.target.value);
  };

  // 新增 hook
  const addHook = () => {
    if (newHook.trim()) {
      setHooks([...hooks, newHook]);
      setNewHook("");
    }
  };

  // 编辑 hook
  const editHook = (index) => {
    const updatedHook = prompt("Edit hook:", hooks[index]);
    if (updatedHook !== null && updatedHook.trim()) {
      const updatedHooks = [...hooks];
      updatedHooks[index] = updatedHook;
      setHooks(updatedHooks);
    }
  };

  // 删除 hook
  const deleteHook = (index) => {
    if (window.confirm("Are you sure you want to delete this hook?")) {
      const updatedHooks = hooks.filter((_, i) => i !== index);
      setHooks(updatedHooks);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>

      {/* 新增 hook 表单 */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={newHook}
          onChange={handleInputChange}
          placeholder="Enter new hook"
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <button
          onClick={addHook}
          style={{
            padding: "8px 16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        >
          Add Hook
        </button>
      </div>

      {/* 显示 hook 列表 */}
      <ul style={{ paddingLeft: "0", listStyleType: "none" }}>
        {hooks.map((hook, index) => (
          <li
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f1f1f1",
              padding: "10px",
              margin: "5px 0",
              borderRadius: "5px",
            }}
          >
            <span>{hook}</span>
            <div>
              <button
                onClick={() => editHook(index)}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#ffa500",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "5px",
                  marginLeft: "5px",
                }}
              >
                Edit
              </button>
              <button
                onClick={() => deleteHook(index)}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "5px",
                  marginLeft: "5px",
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};