import "./content.css";
import { produce } from "immer";
import { useState, useEffect, useRef } from "react";
import {flushSync} from 'react-dom'
import axios from "@/request/axios";
import { useStore } from "@/store";
import Toast from "@/component/Toast";
import Masonry from "react-masonry-css";
const breakpointColumnsObj = {
  default: 3,
  1400: 3,
  1100: 2,
  750: 1,
};
export default function Content() {
  const [hookCount, setHookCount] = useState(0);
  const [utilCount, setUtilCount] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text) => {
    setToastMessage(text);
  };

  const hideToast = () => {
    setToastMessage(null);
  };
  function update(type, count) {
    if (type === 1) {
      setHookCount(count);
    } else {
      setUtilCount(count);
    }
  }
  return (
    <>
      <div className="contain">
        {toastMessage && <Toast message={toastMessage} onClose={hideToast} />}
        <vscode-panels aria-label="With Badge">
          <vscode-panel-tab id="tab-1">
            HOOKS
            <vscode-badge appearance="secondary">{hookCount}</vscode-badge>
          </vscode-panel-tab>
          <vscode-panel-tab id="tab-2">
            UTILS
            <vscode-badge appearance="secondary">{utilCount}</vscode-badge>
          </vscode-panel-tab>
          <vscode-panel-tab id="tab-3">GLObAL</vscode-panel-tab>
          <vscode-panel-view id="view-1">
            <div>
              <h3>Manage Your Hooks</h3>
              <Manager type={1} update={update} showToast={showToast}></Manager>
            </div>
          </vscode-panel-view>
          <vscode-panel-view id="view-2">
            <div>
              <h3>Manage Your Utils</h3>
              <Manager type={2} update={update} showToast={showToast}></Manager>
            </div>
          </vscode-panel-view>
          <vscode-panel-view id="view-3">
            <div>
              <Global update={update} onMessage={showToast}></Global>
            </div>
          </vscode-panel-view>
        </vscode-panels>
      </div>
    </>
  );
}
// 创建模态框组件
function Modal({ type, data, isOpen, onClose, onSave, onMessage }) {
  const [state, setState] = useState({
    name: "",
    description: "",
    content: "",
    privated: false,
    frame: "Vue",
  });
  useEffect(() => {
    if (data) {
      setState({ ...data });
    }
  }, [data]);

  // 处理输入变化
  const handleInputChange = (field) => (e) => {
    console.log(field, "field");
    setState(
      produce((draft) => {
        draft[field] = e.target.value;
      })
    );
  };

  const handleSwitchChange = () => {
    setState(
      produce((draft) => {
        draft.privated = !draft.privated;
      })
    );
  };

  // 保存新的 hook 配置
  const handleSave = async () => {
    const { name, description, content, privated, frame, _id } = state;
    if (_id) {
      const {
        data: { code, message },
      } = await axios.post("update", {
        _id,
        type,
        name,
        description,
        content,
        privated,
        frame,
      });
      if (code === 0) {
        onSave(state, 2);
        handleClose();
      }
      onMessage(message);
    } else {
      const {
        data: { code, data, message },
      } = await axios.post("add", {
        type,
        name,
        description,
        content,
        privated,
        frame,
      });
      if (code === 0) {
        onSave(data, 1);
        handleClose();
      }
      onMessage(message);
    }
  };

  // 关闭模态框
  const handleClose = () => {
    setState({
      name: "",
      description: "",
      content: "",
      privated: false,
      frame: "Vue",
    });
    onClose();
  };

  const handleChange = (e) => {
    setState(
      produce((draft) => {
        draft.frame = e.target.value;
      })
    );
  };
  if (!isOpen) return null;

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h3 style={{ color: "#000", fontSize: "18px" }}>
          {type === 1 ? "Add New Hook" : "Add New Util"}
        </h3>

        {/* Hook/Util Name Input */}
        <div style={modalStyles.inputGroup}>
          <label style={{ fontSize: "16px", color: "#333" }}>
            {type === 1 ? "Hook Name:" : "Util Name:"}
          </label>
          <input
            type="text"
            value={state.name}
            onChange={handleInputChange("name")}
            placeholder={type === 1 ? "Enter hook name" : "Enter util name"}
            style={modalStyles.input}
          />
        </div>

        {/* Hook/Util Description Input */}
        <div style={modalStyles.inputGroup}>
          <label style={{ fontSize: "16px", color: "#333" }}>
            {type === 1 ? "Hook Description:" : "Util Description:"}
          </label>
          <textarea
            value={state.description}
            onChange={handleInputChange("description")}
            placeholder={
              type === 1 ? "Enter hook description" : "Enter util description"
            }
            style={modalStyles.textarea}
          />
        </div>

        {/* Hook/Util Content Input */}
        <div style={modalStyles.inputGroup}>
          <label style={{ fontSize: "16px", color: "#333" }}>
            {type === 1 ? "Hook Content:" : "Util Content:"}
          </label>
          <textarea
            value={state.content}
            onChange={handleInputChange("content")}
            placeholder={
              type === 1 ? "Enter hook content" : "Enter util content"
            }
            style={modalStyles.textarea}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {/* Private Toggle */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <label
              style={{ fontSize: "16px", color: "#333", marginRight: "10px" }}
            >
              Private:
            </label>
            <span
              onClick={handleSwitchChange}
              style={{
                ...switchStyles.slider,
                backgroundColor: state.privated ? "#4CAF50" : "#ccc",
              }}
            >
              <span
                style={{
                  ...switchStyles.sliderBefore,
                  transform: state.privated
                    ? "translateX(14px)"
                    : "translateX(0)",
                }}
              ></span>
            </span>
          </div>
          {type === 1 && (
            <div style={{ display: "flex", gap: "10px" }}>
              <label style={{ fontSize: "16px", color: "#333" }}>
                Applicable Framework:
              </label>
              <label
                style={{
                  fontSize: "16px",
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  type="radio"
                  name="group"
                  value="Vue"
                  checked={state.frame === "Vue"}
                  onChange={handleChange}
                  style={{
                    marginRight: "8px",
                    marginBottom: "3px",
                    appearance: "none" /* 取消默认的单选框样式 */,
                    width: "20px" /* 设置单选框大小 */,
                    height: "20px",
                    borderRadius: "50%" /* 使单选框呈圆形 */,
                    border: "2px solid #ccc" /* 设置默认边框颜色 */,
                    outline: "none",
                    position: "relative" /* 使伪元素能够定位 */,
                    backgroundColor:
                      state.frame === "Vue"
                        ? "#4CAF50"
                        : "transparent" /* 选中时的背景色 */,
                  }}
                />
                Vue
              </label>

              <label
                style={{
                  fontSize: "16px",
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  type="radio"
                  name="group"
                  value="React"
                  checked={state.frame === "React"}
                  onChange={handleChange}
                  style={{
                    marginRight: "8px",
                    marginBottom: "3px",
                    appearance: "none" /* 取消默认的单选框样式 */,
                    width: "20px" /* 设置单选框大小 */,
                    height: "20px",
                    borderRadius: "50%" /* 使单选框呈圆形 */,
                    border: "2px solid #ccc" /* 设置默认边框颜色 */,
                    outline: "none",
                    position: "relative",
                    backgroundColor:
                      state.frame === "React"
                        ? "#4CAF50"
                        : "transparent" /* 选中时的背景色 */,
                  }}
                />
                React
              </label>
            </div>
          )}
        </div>
        {/* Actions: Save & Close Buttons */}
        <div style={modalStyles.actions}>
          <button onClick={handleSave} style={modalStyles.saveButton}>
            Save
          </button>
          <button onClick={handleClose} style={modalStyles.closeButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
function Detail({ data, isOpen, onClose }) {
  const [state, setState] = useState({
    name: "",
    description: "",
    content: "",
    privated: false,
    frame: "Vue",
  });
  const [type, setType] = useState(1);

  useEffect(() => {
    if (data) {
      setState({ ...data });
      if (data.frame) {
        setType(1);
      } else {
        setType(2);
      }
    }
  }, [data]);

  // 关闭模态框
  const handleClose = () => {
    setState({
      name: "",
      description: "",
      content: "",
      privated: false,
      frame: "Vue",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h3 style={{ color: "#000", fontSize: "18px" }}>
          {type === 1 ? "Hook Details" : "Util Details"}
        </h3>

        {/* Hook/Util Name */}
        <div style={modalStyles.inputGroup}>
          <label style={{ fontSize: "16px", color: "#333" }}>
            {type === 1 ? "Hook Name:" : "Util Name:"}
          </label>
          <input
            type="text"
            value={state.name}
            readOnly
            style={modalStyles.input}
          />
        </div>

        {/* Hook/Util Description */}
        <div style={modalStyles.inputGroup}>
          <label style={{ fontSize: "16px", color: "#333" }}>
            {type === 1 ? "Hook Description:" : "Util Description:"}
          </label>
          <textarea
            value={state.description}
            readOnly
            style={modalStyles.textarea}
          />
        </div>

        {/* Hook/Util Content */}
        <div style={modalStyles.inputGroup}>
          <label style={{ fontSize: "16px", color: "#333" }}>
            {type === 1 ? "Hook Content:" : "Util Content:"}
          </label>
          <textarea
            value={state.content}
            readOnly
            style={modalStyles.textarea}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {type === 1 && (
            <div style={{ display: "flex", gap: "10px" }}>
              <label style={{ fontSize: "16px", color: "#333" }}>
                Applicable Framework:
              </label>
              <div
                style={{
                  fontSize: "16px",
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <label
                  style={{
                    marginRight: "8px",
                    marginBottom: "3px",
                    fontSize: "16px",
                    color: "#333",
                  }}
                >
                  {state.frame}
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Actions: Close Button */}
        <div style={modalStyles.actions}>
          <button onClick={handleClose} style={modalStyles.closeButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const ReactTag = () => {
  return (
    <div
      style={{
        display: "inline-block",
        padding: "6px 10px",
        backgroundColor: "#61DAFB",
        color: "#fff",
        borderRadius: "20px",
        fontSize: "14px",
        fontWeight: "bold",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        cursor: "pointer",
        margin: "5px",
      }}
    >
      React
    </div>
  );
};
const VueTag = () => {
  return (
    <div
      style={{
        display: "inline-block",
        padding: "6px 10px",
        backgroundColor: "#42b883",
        color: "#fff",
        borderRadius: "20px",
        fontSize: "14px",
        fontWeight: "bold",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        cursor: "pointer",
        margin: "5px",
      }}
    >
      Vue
    </div>
  );
};
// 样式
const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex:9
  },
  modal: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "600px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  inputGroup: {
    marginBottom: "10px",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginTop: "5px",
    fontSize: "14px",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    height: "150px",
    border: "2px solid #f6f6f6",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
    fontSize: "14px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
    resize: "vertical",
    outline: "none",
    transition: "border-color 0.3s",
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    padding: "8px 16px",
    cursor: "pointer",
    borderRadius: "5px",
  },
  closeButton: {
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    padding: "8px 16px",
    cursor: "pointer",
    borderRadius: "5px",
  },
};

// 自定义滑动开关样式
const switchStyles = {
  slider: {
    position: "relative",
    display: "inline-block",
    width: "34px",
    height: "20px",
    backgroundColor: "#ccc",
    borderRadius: "50px",
    transition: "background-color 0.3s",
  },
  sliderBefore: {
    position: "absolute",
    content: "",
    height: "12px",
    width: "12px",
    borderRadius: "50%",
    backgroundColor: "white",
    left: "4px",
    bottom: "4px",
    transition: "transform 0.3s",
  },
};

// 应用样式
document.styleSheets[0].insertRule(
  `
  input[type="checkbox"]:checked + .slider {
    background-color: #4CAF50; /* 绿色 */
  }
`,
  0
);

document.styleSheets[0].insertRule(
  `
  input[type="checkbox"]:checked + .slider:before {
    transform: translateX(14px); /* 将圆形按钮向右移动 */
  }
`,
  0
);

function Manager({ type, update, showToast }) {
  // 使用 useState 来管理 items 的状态
  const { hooks, utils, setHooks, setUtils } = useStore();
  let pageIndex = useRef(1);
  const [pageSize] = useState(20);
  //const [items, setItems] = useState([]);
  let items;
  let setItems;
  if (type === 1) {
    items = hooks;
    setItems = setHooks;
  } else {
    items = utils;
    setItems = setUtils;
  }
  const [data, setData] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchRef = useRef("");
  const lastItemRef = useRef();
  useEffect(() => {
    getList("");
  }, []);
  async function getList(searchWord) {
    const changed = searchWord !== searchRef.current ? true : false;
    if (changed) {
      pageIndex.current = 1;
    }
    searchRef.current = searchWord;

    const {
      data: { code, data, totalCount },
    } = await axios.post("list", {
      search: searchWord,
      type,
      pageIndex: pageIndex.current,
      pageSize,
    });

    if (code === 0) {
      pageIndex.current += 1;
      console.log(data, items, "ssss");
      if (changed) {
        setItems(data);
      } else {
        setItems([...JSON.parse(JSON.stringify(items)), ...data]);
      }
      update(type, totalCount);
    }
  }
  const callback = (entries, observe) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        console.log(searchRef.current, "searchWord1");
        getList(searchRef.current);
        observe.unobserve(lastItemRef.current);
      }
    });
  };
  const observer = new IntersectionObserver(callback, {
    root: null, // 观察相对于视口
    rootMargin: "0px", // 附加的视口边距
  });
  useEffect(() => {
    if (lastItemRef.current) {
      observer.observe(lastItemRef.current);
    }
  }, [items.length]);
  // 打开模态框
  const openModal = () => {
    setData(null);
    setIsModalOpen(true);
  };

  // 关闭模态框
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 保存新的 item 配置
  const saveItem = (item, type) => {
    //1 新增,2.编辑
    if (type === 1) {
      setItems([item, ...items]);
      update(type, items.length + 1);
    } else {
      let arr = items.map((inner) => {
        if (item._id === inner._id) {
          return item;
        }
        return inner;
      });
      setItems(arr);
    }
    closeModal(); // 关闭模态框
  };

  // 编辑 item
  const editItem = (index) => {
    const cur = items[index];
    setData(cur);
    setIsModalOpen(true);
  };

  // 删除 item
  const deleteItem = async (index) => {
    const {
      data: { code, message },
    } = await axios.post("delete", { deleteId: items[index]._id, type });
    if (code === 0) {
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
      update(type, items.length - 1);
    }
    showToast(message);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <button
        onClick={openModal}
        style={{
          padding: "8px 16px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          cursor: "pointer",
          borderRadius: "5px",
          margin: "0",
        }}
      >
        Add Item
      </button>

      <Modal
        type={type}
        isOpen={isModalOpen}
        data={data}
        onClose={closeModal}
        onSave={saveItem}
        onMessage={showToast}
      />
      {/* 搜索框 */}
      <input
        type="text"
        placeholder="Search items..."
        value={searchRef.current}
        onChange={(e) => getList(e.target.value)} // 每次输入时更新搜索条件
        style={{
          padding: "8px",
          margin: "0",
          marginTop: "20px",
          width: "200px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          display: "block",
          marginBottom:'6px'
        }}
      />
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        style={{ height: "calc(100vh - 240px)", overflow: "auto" }}
        columnClassName="my-masonry-grid_column"
      >
        {items.map((item, index) => (
          <div
            key={item._id}
            ref={index === items.length - 1 ? lastItemRef : null}
            style={{
              display: "flex",
              justifyContent: "space-between",
              backgroundColor: "#f5f5dc",
              padding: "10px",
              margin: "5px 0",
              borderRadius: "5px",
              flexDirection: "column",
              border: "2px solid transparent", // 初始没有边框颜色
              transition: "border 0.3s ease", // 添加过渡效果
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "20px",
                marginBottom: "40px",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  width: "50%", // 设置宽度为50%
                  fontSize: "20px",
                  color: "#000",
                  whiteSpace: "nowrap", // 防止换行
                  overflow: "hidden", // 超出部分隐藏
                  textOverflow: "ellipsis", // 超出部分显示省略号
                }}
              >
                {item.name}
              </div>
              <div>
                <button
                  onClick={() => editItem(index)}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#ffa500",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "5px",
                    margin: "0",
                    marginLeft: "5px",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteItem(index)}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "5px",
                    margin: "0",
                    marginLeft: "5px",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  width: "60%", // 设置宽度为50%
                  whiteSpace: "nowrap", // 防止换行
                  overflow: "hidden", // 超出部分隐藏
                  textOverflow: "ellipsis", // 超出部分显示省略号
                  fontSize: "16px",
                }}
              >
                {item.description}
              </div>
              {item.type === 1 && (
                <div>{item.frame === "Vue" ? <VueTag /> : <ReactTag />}</div>
              )}
            </div>
          </div>
        ))}
      </Masonry>
    </div>
  );
}
function Global({ update, onMessage }) {
  const [items, setItems] = useState([]);
  const [filterType, setFilterType] = useState(["hooks", "utils"]);
  const [subFilter, setSubFilter] = useState(["Vue", "React"]);
  const [data, setData] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const lastItemRef = useRef();
  let pageIndex = useRef(1);
  const searchRef = useRef("");
  const [pageSize] = useState(20);
  let observer =useRef(null)
  const { hooks, utils, setHooks, setUtils } = useStore();
  useEffect(() => {
    getList('');
  }, []);
  // 打开模态框
  const openModal = (item) => {
    setData(item);
    setIsModalOpen(true);
  };

  // 关闭模态框
  const closeModal = () => {
    setIsModalOpen(false);
  };

  async function getList(searchWord,source) {
    const changed = (searchWord !== searchRef.current||source==='button') ? true : false;
    if (changed) {
      pageIndex.current = 1;
    }
    console.log(filterType, "filterType1");
    searchRef.current = searchWord;
    const {
      data: { code, data },
    } = await axios.post("all", {
      search: searchWord,
      filterType,
      subFilter,
      pageIndex: pageIndex.current,
      pageSize,
    });

    if (code === 0) {
      pageIndex.current += 1;
      console.log(data, items, changed,"ssss");
      if (changed) {
        setItems(data);
      } else {
        setItems([...JSON.parse(JSON.stringify(items)), ...data]);
      }
    }
  }
  const callback = (entries, observe) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        console.log(entries.target, "observer1");
        console.log(searchRef.current,lastItemRef.current, "searchWord1");
        getList(searchRef.current);
        observe.unobserve(lastItemRef.current);
      }
    });
  };
  useEffect(() => {
    observer.current = new IntersectionObserver(callback, {
      root: null, // 观察相对于视口
      rootMargin: "0px", // 附加的视口边距
    });
      return () => {
        if (observer.current) {
          observer.current.disconnect();
        
        }
      };
  }, [items.length]);
  useEffect(() => {
    if (lastItemRef.current) {
      observer.current.observe(lastItemRef.current);
    }
  }, [items.length]);

  function handleFilterChange(e) {
    const value = e.target.value;
    setFilterType((prevState) => {
      if (prevState.includes(value)) {
        if (prevState.length === 1) {
          return prevState;
        }
        return prevState.filter((item) => item !== value); // Remove if already selected
      } else {
        return [...prevState, value]; // Add if not selected
      }
    });
  }
  function handleSubFilterChange(e) {
    const value = e.target.value;
    setSubFilter((prevState) => {
      if (prevState.includes(value)) {
        if (prevState.length === 1) {
          return prevState;
        }
        return prevState.filter((item) => item !== value);
      } else {
        return [...prevState, value];
      }
    });
  }

  async function addToMyWorkspace(index, event) {
    event.stopPropagation();
    let type = items[index].frame ? 1 : 2;
    const {
      data: { code, data, message },
    } = await axios.post("add", {
      ...items[index],
      type,
      privated: false,
    });
    if (code === 0) {
      if (type === 1) {
        setHooks([data, ...hooks]);
      } else {
        setUtils([data, ...utils]);
      }
      update(type, (type === 1 ? hooks.length : utils.length) + 1);
      onMessage("Add successfully");
    } else {
      onMessage(message);
    }
  }
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <Detail isOpen={isModalOpen} data={data} onClose={closeModal} />
      <button
        onClick={() => getList(searchRef.current, "button")}
        style={{
          padding: "8px 16px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          cursor: "pointer",
          borderRadius: "5px",
          margin: "0",
        }}
      >
        搜索
      </button>
      {/* 搜索框 */}
      <input
        type="text"
        placeholder="Search items..."
        value={searchRef.current}
        onChange={(e) => {
          getList(e.target.value);
        }} // 每次输入时更新搜索条件
        style={{
          padding: "8px",
          margin: "0",
          marginTop: "20px",
          width: '200px',
          borderRadius: "5px",
          border: "1px solid #ccc",
          display: "block",
        }}
      />

      {/* 多选框：Hooks 和 Utils */}
      <div style={{ marginTop: "20px" }}>
        <label>
          <input
            type="checkbox"
            value="hooks"
            checked={filterType.includes("hooks")}
            onChange={handleFilterChange}
            style={{ marginRight: "8px" }}
          />
          Hooks
        </label>
        <label style={{ marginLeft: "20px" }}>
          <input
            type="checkbox"
            value="utils"
            checked={filterType.includes("utils")}
            onChange={handleFilterChange}
            style={{ marginRight: "8px" }}
          />
          Utils
        </label>
      </div>

      {/* 如果选择了 Hooks，显示 Vue 和 React */}
      {filterType.includes("hooks") && (
        <div style={{ marginTop: "20px" }}>
          <label>
            <input
              type="checkbox"
              value="Vue"
              checked={subFilter.includes("Vue")}
              onChange={handleSubFilterChange}
              style={{ marginRight: "8px" }}
            />
            Vue
          </label>
          <label style={{ marginLeft: "20px" }}>
            <input
              type="checkbox"
              value="React"
              checked={subFilter.includes("React")}
              onChange={handleSubFilterChange}
              style={{ marginRight: "8px" }}
            />
            React
          </label>
        </div>
      )}

      {/* 显示搜索结果 */}
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        style={{height:'calc(100vh - 266px)',overflow:'auto'}}
        columnClassName="my-masonry-grid_column"
      >
        {items.map((item, index) => (
          <div
            data-a={index}
            onClick={() => openModal(item)}
            key={item._id}
            ref={index === items.length - 1 ? lastItemRef : null}
            style={{
              display: "flex",
              justifyContent: "space-between",
              backgroundColor: "#f5f5dc",
              padding: "10px",
              margin: "5px 0",
              borderRadius: "5px",
              flexDirection: "column",
              border: "2px solid transparent", // 初始没有边框颜色
              transition: "border 0.3s ease", // 添加过渡效果
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "20px",
                marginBottom: "40px",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  width: "50%", // 设置宽度为50%
                  fontSize: "20px",
                  color: "#000",
                  whiteSpace: "nowrap", // 防止换行
                  overflow: "hidden", // 超出部分隐藏
                  textOverflow: "ellipsis", // 超出部分显示省略号
                }}
              >
                {item.name}
              </div>
              <div>
                <button
                  onClick={(e) => addToMyWorkspace(index, e)}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#ffa500",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "5px",
                    margin: "0",
                    marginLeft: "5px",
                  }}
                >
                  添加到我的
                </button>
              </div>
            </div>

            {/* 添加作者信息 */}
            <div
              style={{
                display: "flex",
                width: "50%", // 设置宽度为50%
                whiteSpace: "nowrap", // 防止换行
                overflow: "hidden", // 超出部分隐藏
                textOverflow: "ellipsis", // 超出部分显示省略号
                fontSize: "16px",
                marginBottom: "10px", // 给作者信息增加点底部间距
              }}
            >
              <div>author: </div>
              <div
                style={{
                  width: "50%", // 设置宽度为50%
                  whiteSpace: "nowrap", // 防止换行
                  overflow: "hidden", // 超出部分隐藏
                  textOverflow: "ellipsis", // 超出部分显示省略号
                  fontSize: "16px",
                }}
              >
                {item.authorName}
              </div>
            </div>
            <div style={{ display: "flex", position: "relative" }}>
              <div
                style={{
                  width: "60%", // 设置宽度为50%
                  whiteSpace: "nowrap", // 防止换行
                  overflow: "hidden", // 超出部分隐藏
                  textOverflow: "ellipsis", // 超出部分显示省略号
                  fontSize: "16px",
                }}
              >
                {item.description}
              </div>
              <div style={{ position: "absolute", right: 0, bottom: 0 }}>
                {item.frame === "Vue" && <VueTag />}
                {item.frame === "React" && <ReactTag />}
              </div>
            </div>
          </div>
        ))}
      </Masonry>
    </div>
  );
}
