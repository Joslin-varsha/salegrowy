"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
  useReactFlow,
  MiniMap,
  Controls,
  Background,
} from "reactflow";
import Swal from "sweetalert2";
import axios from "axios";
import { flushSync } from "react-dom";
import "reactflow/dist/style.css";

import { Spin, Modal } from "antd";
import CustomStraightEdge from "./CustomStepEdge.jsx";
import Sidebar from "./component/mediaNode/sidebar.jsx";
import AdvanceSideBar from "./component/advanceNode/advanceSideBar.jsx";
import TextSideBar from "./component/simpleNode/Message Node/textSidebar.jsx";
import QuestionNode from "./component/simpleNode/Message Node/QuestionNode.jsx";
import TextMediaNode from "./component/simpleNode/Simple Media/simpleMediaNode.jsx";
import TextMediaSidebar from "./component/simpleNode/Simple Media/textMediaSidebar.jsx";
import TextNode from "./component/mediaNode/TextNode.jsx";
import NodeSideBar from "./chatbotNodeSideBar.jsx";
import AdvanceNode from "./component/advanceNode/advanceNode.jsx";

import InitiateNode from "./component/initiateNode/initiateNode.jsx";
import InitiateWebhookNode from "./component/initiateWebhook/initiateWebhookNode.jsx";
import InitiateWebhookSideBar from "./component/initiateWebhook/initiateWebhookSideBar.jsx";

import NameQuestionNode from "./component/QuestionNodes/Name/NameQuestionNode.jsx";
import NameSidebar from "./component/QuestionNodes/Name/NameSidebar.jsx";

import PhoneQuestionNode from "./component/QuestionNodes/PhoneNumber/PhoneQuestionNode.jsx";
import PhoneSidebar from "./component/QuestionNodes/PhoneNumber/PhoneSidebar.jsx";

import EmailQuestionNode from "./component/QuestionNodes/Email/EmailQuestionNode.jsx";
import EmailSidebar from "./component/QuestionNodes/Email/EmailSidebar.jsx";

import AskQuestionNode from "./component/QuestionNodes/Question/AskQuestionNode.jsx";
import AskSidebar from "./component/QuestionNodes/Question/AskSidebar.jsx";

import ListButtonNode from "./component/advanceNode/listButtons/ListButtonNode.jsx";
import ListButtonSidebar from "./component/advanceNode/listButtons/ListButtonSidebar.jsx";

import PaymentNode from "./component/paymentNode/paymentNode.jsx";
import PaymentSidebar from "./component/paymentNode/paymentSidebar.jsx";

import FlowTemplateNode from "./component/flowTemplate/flowTemplateNode.jsx";
import FlowTemplateSidebar from "./component/flowTemplate/flowTemplateSidebar.jsx";

import ReminderNode from "./component/reminderNode/reminderNode.jsx";
import ReminderSidebar from "./component/reminderNode/reminderSidebar.jsx";

import BusinessHoursNode from "./component/BusinessHours/BusinessHoursNode.jsx";
import BusinessHoursSidebar from "./component/BusinessHours/BusinessHoursSidebar.jsx";

import AiProductNode from "./component/aiProductList/aiProductNode.jsx";
import AiProductSidebar from "./component/aiProductList/aiProductSidebar.jsx";

import InactiveNode from "./component/inActiveFlow/inActiveFlowNode.jsx";
import InactiveSidebar from "./component/inActiveFlow/inActiveFlowSidebar.jsx";

import ApiRequestNode from "./component/apiRequestNode/apiRequestNode.jsx";
import ApiRequestSidebar from "./component/apiRequestNode/apiRequestSidebar.jsx";

import HumanTakeOverNode from "./component/humanTakeoverNode/humanTakeOverNode.jsx";
import HumanTakeOverSidebar from "./component/humanTakeoverNode/humanTakeOverSidebar.jsx";

import ConditionRouterNode from "./component/conditionRouterNode/conditionRouterNode.jsx";
import ConditionRouterSidebar from "./component/conditionRouterNode/conditionRouterSidebar.jsx";

import CatlogNode from "./component/catlogNode/catlogNode.jsx";
import CatlogSidebar from "./component/catlogNode/catlogSidebar.jsx";

import CreateOrderNode from "./component/createOrderNode/createOrderNode.jsx";
import CreateOrderSidebar from "./component/createOrderNode/createOrderSidebar.jsx";

import PincodeNode from "./component/pincodeNode/PincodeNode.jsx";
import PincodeSidebar from "./component/pincodeNode/pincodeSidebar.jsx";

import { Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import Data from "../data/data.js";
import { useNavigate } from "react-router-dom";

// Define custom node types outside the component to avoid re-creation on every render
const nodeTypes = {
  textnode: TextNode,
  initialNodes: InitiateNode,
  initiateWebhookNode: InitiateWebhookNode,
  questionnode: QuestionNode,
  textmedianode: TextMediaNode,
  advancenode: AdvanceNode,
  questionnamenode: NameQuestionNode,
  phonequestionnode: PhoneQuestionNode,
  emailquestionnode: EmailQuestionNode,
  askquestionnode: AskQuestionNode,
  listbuttonnodde: ListButtonNode,
  paymentnode: PaymentNode,
  flowtemplatenode: FlowTemplateNode,
  aiProductNode: AiProductNode,
  inactiveNode: InactiveNode,
  apirequestnode: ApiRequestNode,
  conditionrouternode: ConditionRouterNode,
  remindernode: ReminderNode,
  businesshoursnode: BusinessHoursNode,
  humantakeovernode: HumanTakeOverNode,
  catlognode: CatlogNode,
  createordernode: CreateOrderNode,
  pincodenode: PincodeNode,
};

// Define custom edge types outside the component
const edgeTypes = { step: CustomStraightEdge };

// Key for local storage
const flowKey = "flow-key";

const dataUserId = Data.data.map((user) => user.id);


const initialNodes = [];
const primaryId = "0";
let idCounter = 0;

// Function for generating unique IDs for nodes
// 

const newGetId = () => `${primaryId}-node_${idCounter++}`;

//const newGetId = () => `0-node_4`;

const App = () => {

  // States and hooks setup
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedElements, setSelectedElements] = useState([]);
  const [nodeName, setNodeName] = useState("");
  const [nodeId, setNodeId] = useState("");
  const [isAdded, setIsAdded] = useState("");
  const [nodeImage, setNodeImage] = useState("");
  const [nodeCaption, setNodeCaption] = useState("");
  const [nodeLink, setNodeLink] = useState("");
  const [nodeOption, setNodeOption] = useState("");
  const [nodeVideo, setNodeVideo] = useState("");
  const [nodeAudio, setNodeAudio] = useState("");
  const [nodeFile, setNodeFile] = useState("");
  const [nodeCta, setNodeCta] = useState("");
  const [nodeCtaButton, setNodeCtaButton] = useState("");
  const [nodeButton1, setNodeButton1] = useState("");
  const [nodeButton2, setNodeButton2] = useState("");
  const [nodeButton3, setNodeButton3] = useState("");
  const [nodeFooter1, setNodeFooter1] = useState("");
  const [nodeFooter2, setNodeFooter2] = useState("");
  const [nodeFooter3, setNodeFooter3] = useState("");
  const [nodeButtons, setNodeButtons] = useState([]);
  const [nodeList, setNodeList] = useState([]);
  const [nodeBotId, setNodeBotId] = useState("");
  const [flowData, setFlowData] = useState(null);
  const [showSaveBtn, setShowSaveBtn] = useState(false);
  const [webHookUrl, setWebHookUrl] = useState("");
  const [footerText, setFooterText] = useState("");
  const [isNewNode, setIsNewNode] = useState(true);

  const vendor_uid = localStorage.getItem('vendor_uid');
  const bot_flow_uid = localStorage.getItem('bot_flow_uid');
  const starting_message = localStorage.getItem('start_message');
  const bot_flow_type = localStorage.getItem('bot_flow_type');

  const { fitView } = useReactFlow();
  const { deleteElements } = useReactFlow();
  // Setup viewport
  const { setViewport } = useReactFlow();


  const handleDeleteNode = useCallback((nodeId, type) => {
    // 1. Update UI state (this also updates react-flow graph automatically)
    if (type === "") {
      setTimeout(() => {
        setSelectedElements([]);
      }, 0);
    } else {
      flushSync(() => {
        setNodes((prev) => prev.filter((n) => n.id !== nodeId));
        setEdges((prev) =>
          prev.filter((e) => e.source !== nodeId && e.target !== nodeId)
        );
        setSelectedElements([]);
      });
      const updatedFlow = reactFlowInstance.toObject();
      updateflow(updatedFlow);
    }

  },);

  const handleDuplicateNode = useCallback((newNode) => {

    var uniqueId = newGetId(); // or use Date.now() if you prefer

    console.log("uniqueId", uniqueId);

    setTimeout(() => {
      setSelectedElements([]);
    }, 0);

    const duplicatedNode = {
      ...newNode,
      id: uniqueId,
      position: {
        x: (newNode.position?.x || 0) + 50, // shift position a bit
        y: (newNode.position?.y || 0) + 50,
      },
      data: {
        ...newNode.data,
        isAdded: true,
      },
    };

    setNodes((nds) => [...nds, duplicatedNode]);
  }, [setNodes, setFlowData]);

  const memoizedNodes = useMemo(() =>
    nodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        onDeleteNode: handleDeleteNode,
        onDuplicateNode: handleDuplicateNode
      }
    })),
    [nodes, handleDeleteNode, handleDuplicateNode]
  );

  useEffect(() => {
    if (selectedElements.length > 0) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedElements[0]?.id
            ? {
              ...node,
              data: {
                ...node.data,
                label: nodeName,
                image: nodeImage,
                captions: nodeCaption,
                link: nodeLink,
                bot_reply_id: nodeBotId,
                webhook_url: webHookUrl,
                footer_text: footerText,
                video: nodeVideo,
                audio: nodeAudio,
                file: nodeFile,
                cta: nodeCta,
                ctabutton: nodeCtaButton,
                buttons: nodeButtons,
                list: nodeList,
                button1: nodeButton1,
                button2: nodeButton2,
                button3: nodeButton3,
                footer1: nodeFooter1,
                footer2: nodeFooter2,
                footer3: nodeFooter3,

              },
            }
            : node
        )
      );
    }
  }, [
    nodeName,
    nodeImage,
    nodeCaption,
    nodeLink,
    nodeVideo,
    nodeAudio,
    nodeFile,
    nodeCta,
    nodeCtaButton,
    nodeButtons,
    nodeList,
    nodeButton1,
    nodeButton2,
    nodeButton3,
    nodeFooter1,
    nodeFooter2,
    nodeFooter3,
    selectedElements,
    webHookUrl,
  ]);

  useEffect(() => {
    if (selectedElements.length === 0) {
      setNodeName("");
      setNodeId("")
      setNodeImage("");
      setNodeCaption("");
      setWebHookUrl("");
      setFooterText("")
      setNodeLink("");
      setNodeOption("");
      setNodeVideo("");
      setNodeFile("");
      setNodeAudio("");
      setNodeCta("");
      setNodeCtaButton("");
      setNodeButtons([]);
      setNodeList([]);
      setNodeButton1("");
      setNodeButton2("");
      setNodeButton3("");
      setNodeFooter1("");
      setNodeFooter2("");
      setNodeFooter3("");
    }

  }, [selectedElements]);

  // Call API once when screen opens
  useEffect(() => {
    getFlowChart();
  }, []);

  const onNodeClick = useCallback((_event, node) => {
    if (selectedElements.length > 0 && selectedElements[0].id === node.id) return;
    setSelectedElements([node]);
    setNodeName(node.data.label || "");
    setNodeId(node.id || "");
    setIsAdded(node.data?.isAdded || false);
    setNodeImage(node.data.image || "");
    setNodeCaption(node.data.captions || "");
    setWebHookUrl(node.data.webhook_url || "");
    setFooterText(node.data.footer_text || "");
    setNodeVideo(node.data.video || "");
    setNodeAudio(node.data.audio || "");
    setNodeFile(node.data.file || "");
    setNodeCta(node.data.cta || "");
    setNodeCtaButton(node.data.ctabutton || "");
    setNodeButtons(node.data.buttons || []);
    setNodeList(node.data.list || []);
    setNodeButton1(node.data.nodebutton1 || "");
    setNodeButton2(node.data.nodebutton2 || "");
    setNodeButton3(node.data.nodebutton3 || "");
    setNodeFooter1(node.data.nodefooter1 || "");
    setNodeFooter2(node.data.nodefooter2 || "");
    setNodeFooter3(node.data.nodefooter3 || "");
    node.data.link || "";
    setNodes((nodes) =>
      nodes.map((n) => ({
        ...n,
        selected: n.id === node.id,
      }))
    );
    // setNodes((nodes) =>
    //   nodes.map((n) => ({
    //     ...n,
    //     selected: n.id === node.id,
    //     data:{
    //       ...node.data,
    //       id: nodeBotId,
    //     }
    //   }))
    // );

  }, [selectedElements]);

  // Check for empty target handles
  const checkEmptyTargetHandles = () => {
    let emptyTargetHandles = 0;
    edges.forEach((edge) => {
      if (!edge.targetHandle) {
        emptyTargetHandles++;
      }
    });
    return emptyTargetHandles;
  };

  // Check if any node is unconnected
  const isNodeUnconnected = useCallback(() => {
    let unconnectedNodes = nodes.filter(
      (node) =>
        !edges.find(
          (edge) => edge.source === node.id || edge.target === node.id
        )
    );

    return unconnectedNodes.length > 0;
  }, [nodes, edges]);

  const updateflow = useCallback(async (updatedFlow = null) => {
    if (!reactFlowInstance) return;

    // if updatedFlow not passed, generate from instance
    const flow = updatedFlow || reactFlowInstance.toObject();
    console.log(flow);

    const emptyTargetHandles = checkEmptyTargetHandles();

    // if (nodes.length > 1 && (emptyTargetHandles > 1 || isNodeUnconnected())) {
    //   Swal.fire({
    //     icon: "error",
    //     title: "Error",
    //     text: "More than one node has an empty target handle or there are unconnected nodes.",
    //   });
    //   return;
    // }

    let nodePayload = JSON.stringify(flow);
    nodePayload = nodePayload.replace(/\\/g, "");
    localStorage.setItem(flowKey, JSON.stringify(flow));
    console.log(JSON.stringify(flow));

    try {
      const payload = {
        vendor_uid,
        bot_flow_uid,
        nodes: nodePayload,
      };

      const response = await axios.post(
        `https://dev.salegrowybox.com/api/storeNodes`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      const data = response.data;

      // if (data.success === "success") {
      //   Swal.fire({
      //     icon: "success",
      //     title: "Success",
      //     text: "Save successful!",
      //   });
      // } else {
      //   Modal.error({
      //     title: "Error",
      //     content: data.errors?.name || data.message || "Something went wrong",
      //     centered: true,
      //     okText: "OK",
      //     okButtonProps: {
      //       className: "no-btn-hover-red"
      //     }
      //   });
      // }
    } catch (err) {
      // if (err.response) {
      //   Modal.error({
      //     title: "Error",
      //     content: err.response.data?.message ||
      //     err.response.data?.errors?.name ||
      //     "Failed to save data",
      //     centered: true,
      //     okText: "OK",
      //     okButtonProps: {
      //       className: "no-btn-hover-red"
      //     }
      //   });
      // } else {
      //   Modal.error({
      //     title: "Error",
      //     content: "Something went wrong: " + err.message,
      //     centered: true,
      //     okText: "OK",
      //     okButtonProps: {
      //       className: "no-btn-hover-red"
      //     }
      //   });
      // }
    }
  }, [reactFlowInstance, nodes, isNodeUnconnected]);


  const createDefaultQuestionNode = useCallback(() => {
    const defaultNodeId = "Initiate";
    const defaultNode = {
      id: defaultNodeId,
      type: "initialNodes", // Make sure this matches your nodeTypes
      position: { x: 300, y: 200 },
      data: {
        label: starting_message,
        isAdded: true,
        bot_reply_id: "",
        // Add any default values you want
      },
    };

    setNodes([defaultNode]);
    setEdges([]);

    // Save this default node immediately
    setTimeout(() => {
      if (reactFlowInstance) {
        const flow = reactFlowInstance.toObject();
        updateflow(flow);
      }
    }, 500);

    // Optional: Zoom to node
    setTimeout(() => {
      fitView({ nodes: [{ id: defaultNodeId }], duration: 800 });
    }, 100);
  }, [reactFlowInstance, setNodes, setEdges, fitView, updateflow]);

  const createDefaultWebhookNode = useCallback(() => {
    const defaultNodeId = "Initiate";
    const webhookNodeId = newGetId();

    const defaultNode = {
      id: defaultNodeId,
      type: "initialNodes", // Make sure this matches your nodeTypes
      position: { x: 100, y: 200 },
      data: {
        label: "",
        isAdded: true,
        bot_reply_id: "",
        // Add any default values you want
      },
    };

    // const webhookNode = {
    //   id: webhookNodeId,
    //   type: "initiateWebhookNode", // Make sure this matches your nodeTypes
    //   position: { x: 500, y: 200 },
    //   data: {
    //     label: "Webhook",
    //     isAdded: true,
    //     bot_reply_id: "",
    //     // Add any default values you want
    //   },
    // };

    const initialEdge = {
      id: `e${defaultNodeId}-${webhookNodeId}`,
      source: defaultNodeId,
      target: webhookNodeId,
      sourceHandle: "b",
      targetHandle: "a",
      type: "step", // or your custom edge type
      animated: true,
    };
   setNodes([defaultNode]);
    // setNodes([defaultNode, webhookNode]);
    // setEdges([initialEdge]);

    // Save this default node immediately
    setTimeout(() => {
      if (reactFlowInstance) {
        const flow = reactFlowInstance.toObject();
        updateflow(flow);
      }
    }, 500);

    // Optional: Zoom to node
    setTimeout(() => {
      fitView({ nodes: [{ id: defaultNodeId }, { id: webhookNodeId }], duration: 800 });
    }, 100);
  }, [reactFlowInstance, setNodes, setEdges, fitView, updateflow]);


  const getFlowChart = async () => {
    const payload = {
      vendor_uid: vendor_uid,
      botflow_uid: bot_flow_uid,
    };

    try {
      const response = await fetch(`https://dev.salegrowybox.com/api/botFlowByuid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        Modal.error({
          title: "Error",
          content: data.errors?.name || data.message || "Failed to fetch variables",
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });
        return;
      }

      if (data.success && data.data) {
        try {
          if (data.data.new__data !== null) {
            const parsedData = JSON.parse(data.data.new__data);
            const hasNodes = parsedData?.nodes && parsedData.nodes.length > 0;
            // const parsedData = dat11.nodes;
            // const hasNodes = parsedData?.nodes && parsedData.nodes.length > 0;

            // Check if nodes exists AND has elements

            if (!hasNodes) {
              if(bot_flow_type === "Normal"){
                createDefaultQuestionNode();
              }else{
                createDefaultWebhookNode();
              }
            } else {
              let maxNum = 0;
              parsedData.nodes.forEach((node) => {
                const match = node.id.match(/node_(\d+)/);
                if (match) {
                  const num = parseInt(match[1], 10);
                  if (num > maxNum) maxNum = num;
                }
              });
              idCounter = idCounter + maxNum + 1;
              setFlowData(parsedData);
            }

          } else {
            if(bot_flow_type === "Normal"){
              createDefaultQuestionNode();
            }else{
              createDefaultWebhookNode();
            }
          }
          setShowSaveBtn(true);
        } catch (e) {
          console.error("Error parsing __data JSON:", e);
        }
      } else {
        Modal.error({
          title: "Error",
          content: "Something went wrong while fetching flow chart data.",
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });
      }
    } catch (error) {
      console.error("Error fetching flow chart:", error);
      Modal.error({
        title: "Error",
        content: "Something went wrong. Please try again later.",
        centered: true,
        okText: "OK",
        okButtonProps: {
          className: "no-btn-hover-red"
        }
      });
    }
  };


  const onInit = useCallback(() => {
    if (!flowData) return;

    const { x = 0, y = 0, zoom = 1 } = flowData.viewport || {};

    setNodes(flowData.nodes || []);
    setEdges(flowData.edges || []);
    setViewport({ x, y, zoom });

    console.log("Flow initialized successfully!");
  }, [flowData, setNodes, setEdges, setViewport]);


  // Call onInit AFTER data is fetched (with delay)
  useEffect(() => {
    if (flowData) {
      const timer = setTimeout(() => {
        onInit();
      }, 1000); // wait 1 seconds
      return () => clearTimeout(timer);
    }
  }, [flowData, onInit]);

  // const onInit = useCallback(() => {
  //   const restoreFlow = async () => {
  //     const flow = flowData;

  //     if (flow) {
  //       const { x = 0, y = 0, zoom = 1 } = flow.viewport;
  //       setNodes(flow.nodes || []);
  //       setEdges(flow.edges || []);
  //       setViewport({ x, y, zoom });
  //     }
  //   };

  //   restoreFlow();
  // }, [setNodes, setViewport]);


  // Save flow to local storage
  const onSave = useCallback(async () => {
    const flow = reactFlowInstance.toObject();
    console.log(flow);
    if (reactFlowInstance) {
      const emptyTargetHandles = checkEmptyTargetHandles();;

      // if (nodes.length > 1 && (emptyTargetHandles > 1 || isNodeUnconnected())) {
      //   Swal.fire({
      //     icon: "error",
      //     title: "Error",
      //     text: "More than one node has an empty target handle or there are unconnected nodes.",
      //   });
      // } else {
        const flow = reactFlowInstance.toObject();
        let nodePayload = JSON.stringify(flow);
        nodePayload = nodePayload.replace(/\\/g, "");
        localStorage.setItem(flowKey, JSON.stringify(flow));
        console.log(JSON.stringify(flow));
        try {

          // Build payload
          const payload = {
            vendor_uid: vendor_uid,
            bot_flow_uid: bot_flow_uid,
            nodes: nodePayload,
          };

          // Send API request with Axios
          const response = await axios.post(
            `https://dev.salegrowybox.com/api/storeNodes`,
            payload,
            { headers: { "Content-Type": "application/json" } }
          );

          const data = response.data;
          if (data.success) {
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Save successful!",
              timer: 2000,              // Close after 2 seconds
              timerProgressBar: true,   // Optional: shows a progress bar
              showConfirmButton: false  // Hide OK button (optional)
            });
          }
          else {
            // Modal.error({
            //   title: "Error",
            //   content: data.errors?.name || data.message || "Something went wrong",
            //   centered: true,
            //   okText: "OK",
            //   okButtonProps: {
            //     className: "no-btn-hover-red"
            //   }
            // });

            let content =
              data.errors?.name ||
              data.message ||
              "Something went wrong";

            // if backend sends which node failed, e.g. data.node_id or data.error_node_id
            const errorNodeId = data.errorNodeId || "";

            if (errorNodeId) {
              const label = getNodeLabelById(errorNodeId);
              content = `BOT : ${label} Not Saved. Please Save this node`
              highlightErrorNode(errorNodeId);
            }

            Modal.error({
              title: "Error",
              content,
              centered: true,
              okText: "OK",
              okButtonProps: {
                className: "no-btn-hover-red",
              },
            });
          }
        } catch (err) {
          if (err.response) {
            // Handle server errors (non-2xx)
            Modal.error({
              title: "Error",
              content: err.response.data?.message ||
                err.response.data?.errors?.name ||
                "Failed to save data",
              centered: true,
              okText: "OK",
              okButtonProps: {
                className: "no-btn-hover-red"
              }
            });
          } else {
            // Handle network or unknown errors
            Modal.error({
              title: "Error",
              content: "Something went wrong: " + err.message,
              centered: true,
              okText: "OK",
              okButtonProps: {
                className: "no-btn-hover-red"
              }
            });
          }
        }
      // }
    }
  }, [reactFlowInstance, nodes, isNodeUnconnected]);

  const highlightErrorNode = (id) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? {
            ...node,
            selected: false,
            style: {
              ...node.style,
              border: "2px solid red",
              borderRadius: "8px",
              boxShadow: "0 0 10px red",
            },
          }
          : node
      )
    );
  };

  const getNodeLabelById = (nodeId) => {
    const node = nodes.find((n) => n.id === String(nodeId));

    // Your React Flow nodes usually store label in: node.data.label
    if (node?.data?.label) return node.data.label;

    // fallback if label not found
    return node?.id || nodeId;
  };

  // Restore flow from local storage
  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(flowKey));

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };
    restoreFlow();
  }, [setNodes, setViewport]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setViewport({ x: 10, y: 90, zoom: 0.89 }); // Adjust zoom level
    }, 0); // Increased delay for React Flow readiness

    return () => clearTimeout(timeout);
  }, [setViewport]); // Ensure it runs after mounting

  // Handle edge connection
  // const onConnect = useCallback(
  //   (params) => {
  //     console.log("Edge created: ", params);
  //     setEdges((eds) => addEdge(params, eds));
  //   },
  //   [setEdges]
  // );

  const onConnect = useCallback(
    (params) => {
      console.log("Edge created: ", params);
      setEdges((eds) =>
        addEdge({ ...params, type: "step" }, eds) // Force straight edges
      );
    },
    [setEdges]
  );

  // Enable drop effect on drag over
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);


  // Handle drop event to add a new node
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      if (type === "catlognode") {
        // Check catalog availability before creating node

        fetch(`https://dev.salegrowybox.com/api/checkCatalog`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vendor_uid: vendor_uid
          })
        })
          .then(response => response.json())
          .then(data => {
            // Only create node if catalog is available
            if (data.success === true) {
              const position = reactFlowInstance.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
              });

              var newNodeId = newGetId();

              const newNode = {
                id: newNodeId,
                type,
                position,
                data: {
                  label: `${type}`,
                  isAdded: true,
                },
              };

              setNodes((nds) => nds.concat(newNode));
              // Zoom to the new node
              setTimeout(() => {
                fitView({
                  nodes: [{ id: newNode.id }],
                  duration: 500,
                  maxZoom: 1.0,
                });
              }, 0);
            } else {
              // Show error message if catalog not available
              Modal.error({
                title: "Catalog Unavailable",
                content: data.message || 'Catalog not available for this vendor',
                centered: true,
                okText: "OK",
                okButtonProps: {
                  className: "no-btn-hover-red"
                }
              });
            }
          })
          .catch(error => {
            console.error('Error checking catalog:', error);
            alert('Error checking catalog availability');
          });
        return;
      }
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      var newNodeId = newGetId();

      const newNode = {
        id: newNodeId,
        type,
        position,
        data: {
          label: `${type}`,
          isAdded: true,
        },
      };

      setNodes((nds) => nds.concat(newNode));
      // Zoom to the new node
      setTimeout(() => {
        fitView({
          nodes: [{ id: newNode.id }],
          duration: 500,
          maxZoom: 1.0, // Zoom in to 1.5x for focus
        });
      }, 0);
    },
    [reactFlowInstance, flowData]
  );

  const rfStyle = {
    backgroundColor: "#111827",
  };

  const [showSidebar, setShowSidebar] = useState(false);

  const onMenuShow = () => {
    setShowSidebar(!showSidebar);
  };

  const [userData, setUserData] = useState(Data.data);

  // Function to update the user name
  const updateUserName = (newName) => {
    setUserData([...Data.data]); // Re-render by setting updated data
  };


  useEffect(() => {
    fitView({ padding: 0.5 }); // Adjust padding as needed
  }, []);

  return (
    <div className="flex flex-row h-full w-full lg:flex-row overflow-hidden flex-1">
      {showSidebar && (
        <NodeSideBar
          nodeName={nodeName}
          setNodeName={setNodeName}
          nodeId={nodeId}
          nodeImage={nodeImage}
          setNodeImage={setNodeImage}
          nodeCaption={nodeCaption}
          setNodeCaption={setNodeCaption}
          nodeVideo={nodeVideo}
          setNodeVideo={setNodeVideo}
          nodeAudio={nodeAudio}
          setNodeAudio={setNodeAudio}
          nodeFile={nodeFile}
          setNodeFile={setNodeFile}
          nodeLink={nodeLink}
          setNodeLink={setNodeLink}
          nodeCta={nodeCta}
          setNodeCta={setNodeCta}
          nodeCtaButton={nodeCtaButton}
          setNodeCtaButton={setNodeCtaButton}
          nodeOption={nodeOption}
          setNodeOption={setNodeOption}
          selectedNode={selectedElements[0]}
          setSelectedElements={setSelectedElements}
        />
      )}

      <div className="flex-grow h-full" ref={reactFlowWrapper}>
        <ReactFlow
          //  defaultZoom={0.80}
          nodes={memoizedNodes}
          nodeTypes={nodeTypes}
          edges={edges}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          style={rfStyle}
          onNodeClick={onNodeClick}
          onPaneClick={() => {
            setSelectedElements([]); // Reset selected elements when clicking on pane
            setNodes((nodes) =>
              nodes.map((n) => ({
                ...n,
                selected: false, // Reset selected state of nodes when clicking on pane
              }))
            );
          }}
          fitView>
          <Background variant="dots" gap={12} size={1} />
          <Controls />
          {/* <MiniMap zoomable pannable /> */}
          <Panel position="top-left" className="flex flex-row items-center gap-4 p-2">
            <motion.button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-3 rounded-full shadow-lg"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              onClick={onMenuShow}>
              {showSidebar ?
                <X size={16} />
                :
                <Plus size={16} />
              }
            </motion.button>
            {
              showSaveBtn && (
                <div className="flex flex-row items-center gap-4 ml-4">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-sm transition-all"
                    onClick={onSave}>
                    save flow
                  </button>
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-sm transition-all"
                    onClick={onRestore}>
                    restore flow
                  </button>
                </div>
              )
            }
          </Panel>
        </ReactFlow>
      </div>

      {selectedElements[0]?.type === "textnode" ? (
        <Sidebar
          dataUserId={dataUserId}
          nodeName={nodeName}
          setNodeName={setNodeName}
          nodeId={nodeId}
          nodeImage={nodeImage}
          setNodeImage={setNodeImage}
          nodeCaption={nodeCaption}
          setNodeCaption={setNodeCaption}
          nodeVideo={nodeVideo}
          setNodeVideo={setNodeVideo}
          nodeAudio={nodeAudio}
          setNodeAudio={setNodeAudio}
          nodeFile={nodeFile}
          setNodeFile={setNodeFile}
          nodeLink={nodeLink}
          setNodeLink={setNodeLink}
          nodeFooter1={nodeFooter1}
          setNodeFooter1={setNodeFooter1}
          nodeFooter2={nodeFooter2}
          setNodeFooter2={setNodeFooter2}
          nodeFooter3={nodeFooter3}
          setNodeFooter3={setNodeFooter3}
          selectedNode={selectedElements[0]}
          setSelectedElements={setSelectedElements}
          setNodeBotId={setNodeBotId}
          nodeBotId={nodeBotId}
        />
      ) : selectedElements[0]?.type === "questionnode" ? (
        <TextSideBar
          dataUserId={dataUserId}
          nodeName={nodeName}
          setNodeName={setNodeName}
          nodeId={nodeId}
          nodeLink={nodeLink}
          setNodeLink={setNodeLink}
          webHookUrl={webHookUrl}
          setWebHookUrl={setWebHookUrl}
          nodeFooter1={nodeFooter1}
          setNodeFooter1={setNodeFooter1}
          nodeFooter2={nodeFooter2}
          setNodeFooter2={setNodeFooter2}
          nodeFooter3={nodeFooter3}
          setNodeFooter3={setNodeFooter3}
          selectedNode={selectedElements[0]}
          setSelectedElements={setSelectedElements}
          setNodeBotId={setNodeBotId}
          nodeBotId={nodeBotId}
          isNewNode={selectedElements[0]?.data?.isAdded}
          reactFlowInstance={reactFlowInstance}
          edges={edges}
          nodes={nodes}
          flowKey={flowKey} />
      ) : selectedElements[0]?.type === "questionnamenode" ? (
        <NameSidebar
          dataUserId={userData.map((user) => user.id)}
          updateUserName={updateUserName}
          nodeName={nodeName}
          setNodeName={setNodeName}
          nodeId={nodeId}
          nodeLink={nodeLink}
          setNodeLink={setNodeLink}
          nodeFooter1={nodeFooter1}
          setNodeFooter1={setNodeFooter1}
          nodeFooter2={nodeFooter2}
          setNodeFooter2={setNodeFooter2}
          nodeFooter3={nodeFooter3}
          setNodeFooter3={setNodeFooter3}
          selectedNode={selectedElements[0]}
          setSelectedElements={setSelectedElements}
          setNodeBotId={setNodeBotId}
          nodeBotId={nodeBotId}
        />
      )
        : selectedElements[0]?.type === "initialNodes" ? (
          null
        )
        : selectedElements[0]?.type === "initiateWebhookNode" ? (
          null
            // <InitiateWebhookSideBar
            //   dataUserId={userData.map((user) => user.id)}
            //   updateUserName={updateUserName}
            //   nodeName={nodeName}
            //   setNodeName={setNodeName}
            //   webHookUrl={webHookUrl}
            //   setWebHookUrl={setWebHookUrl}
            //   nodeId={nodeId}
            //   nodeLink={nodeLink}
            //   setNodeLink={setNodeLink}
            //   nodeFooter1={nodeFooter1}
            //   setNodeFooter1={setNodeFooter1}
            //   nodeFooter2={nodeFooter2}
            //   setNodeFooter2={setNodeFooter2}
            //   nodeFooter3={nodeFooter3}
            //   setNodeFooter3={setNodeFooter3}
            //   selectedNode={selectedElements[0]}
            //   setSelectedElements={setSelectedElements}
            //   setNodeBotId={setNodeBotId}
            //   nodeBotId={nodeBotId}
            //   isNewNode={selectedElements[0]?.data?.isAdded}
            //   reactFlowInstance={reactFlowInstance}
            //   edges={edges}
            //   nodes={nodes}
            //   flowKey={flowKey}
            // />
          )

          : selectedElements[0]?.type === "phonequestionnode" ? (
            <PhoneSidebar
              dataUserId={userData.map((user) => user.id)}
              updateUserName={updateUserName}
              nodeName={nodeName}
              setNodeName={setNodeName}
              webHookUrl={webHookUrl}
              setWebHookUrl={setWebHookUrl}
              nodeId={nodeId}
              nodeLink={nodeLink}
              setNodeLink={setNodeLink}
              nodeFooter1={nodeFooter1}
              setNodeFooter1={setNodeFooter1}
              nodeFooter2={nodeFooter2}
              setNodeFooter2={setNodeFooter2}
              nodeFooter3={nodeFooter3}
              setNodeFooter3={setNodeFooter3}
              selectedNode={selectedElements[0]}
              setSelectedElements={setSelectedElements}
              setNodeBotId={setNodeBotId}
              nodeBotId={nodeBotId}
              isNewNode={selectedElements[0]?.data?.isAdded}
              reactFlowInstance={reactFlowInstance}
              edges={edges}
              nodes={nodes}
              flowKey={flowKey}
            />
          )
            : selectedElements[0]?.type === "emailquestionnode" ? (
              <EmailSidebar
                dataUserId={userData.map((user) => user.id)}
                updateUserName={updateUserName}
                nodeName={nodeName}
                setNodeName={setNodeName}
                nodeId={nodeId}
                nodeLink={nodeLink}
                setNodeLink={setNodeLink}
                nodeFooter1={nodeFooter1}
                setNodeFooter1={setNodeFooter1}
                nodeFooter2={nodeFooter2}
                setNodeFooter2={setNodeFooter2}
                nodeFooter3={nodeFooter3}
                setNodeFooter3={setNodeFooter3}
                selectedNode={selectedElements[0]}
                setSelectedElements={setSelectedElements}
                setNodeBotId={setNodeBotId}
                nodeBotId={nodeBotId}
              />
            )
              : selectedElements[0]?.type === "askquestionnode" ? (
                <AskSidebar
                  dataUserId={userData.map((user) => user.id)}
                  updateUserName={updateUserName}
                  nodeName={nodeName}
                  setNodeName={setNodeName}
                  nodeId={nodeId}
                  nodeLink={nodeLink}
                  setNodeLink={setNodeLink}
                  nodeFooter1={nodeFooter1}
                  setNodeFooter1={setNodeFooter1}
                  nodeFooter2={nodeFooter2}
                  setNodeFooter2={setNodeFooter2}
                  nodeFooter3={nodeFooter3}
                  setNodeFooter3={setNodeFooter3}
                  selectedNode={selectedElements[0]}
                  setSelectedElements={setSelectedElements}
                  setNodeBotId={setNodeBotId}
                  nodeBotId={nodeBotId}
                />
              )
                : selectedElements[0]?.type === "listbuttonnodde" ? (
                  <ListButtonSidebar
                    dataUserId={dataUserId}
                    nodeName={nodeName}
                    setNodeName={setNodeName}
                    nodeId={nodeId}
                    nodeImage={nodeImage}
                    setNodeImage={setNodeImage}
                    nodeVideo={nodeVideo}
                    setNodeVideo={setNodeVideo}
                    nodeAudio={nodeAudio}
                    setNodeAudio={setNodeAudio}
                    nodeFile={nodeFile}
                    setNodeFile={setNodeFile}
                    nodeLink={nodeLink}
                    setNodeLink={setNodeLink}
                    nodeCta={nodeCta}
                    setNodeCta={setNodeCta}
                    nodeCtaButton={nodeCtaButton}
                    setNodeCtaButton={setNodeCtaButton}
                    nodeButtons={nodeButtons}
                    setNodeButtons={setNodeButtons}
                    nodeList={nodeList}
                    setNodeList={setNodeList}
                    nodeButton1={nodeButton1}
                    setNodeButton1={setNodeButton1}
                    nodeButton2={nodeButton2}
                    setNodeButton2={setNodeButton2}
                    nodeButton3={nodeButton3}
                    setNodeButton3={setNodeButton3}
                    nodeFooter1={nodeFooter1}
                    setNodeFooter1={setNodeFooter1}
                    nodeFooter2={nodeFooter2}
                    setNodeFooter2={setNodeFooter2}
                    nodeFooter3={nodeFooter3}
                    setNodeFooter3={setNodeFooter3}
                    selectedNode={selectedElements[0]}
                    setSelectedElements={setSelectedElements}
                    setNodeBotId={setNodeBotId}
                    nodeBotId={nodeBotId}
                  />
                )
                  : selectedElements[0]?.type === "textmedianode" ? (
                    <TextMediaSidebar
                      dataUserId={dataUserId}
                      nodeName={nodeName}
                      setNodeName={setNodeName}
                      nodeId={nodeId}
                      nodeImage={nodeImage}
                      setNodeImage={setNodeImage}
                      nodeCaption={nodeCaption}
                      setNodeCaption={setNodeCaption}
                      webHookUrl={webHookUrl}
                      setWebHookUrl={setWebHookUrl}
                      nodeVideo={nodeVideo}
                      setNodeVideo={setNodeVideo}
                      nodeAudio={nodeAudio}
                      setNodeAudio={setNodeAudio}
                      nodeFile={nodeFile}
                      setNodeFile={setNodeFile}
                      nodeLink={nodeLink}
                      setNodeLink={setNodeLink}
                      nodeFooter1={nodeFooter1}
                      setNodeFooter1={setNodeFooter1}
                      nodeFooter2={nodeFooter2}
                      setNodeFooter2={setNodeFooter2}
                      nodeFooter3={nodeFooter3}
                      setNodeFooter3={setNodeFooter3}
                      selectedNode={selectedElements[0]}
                      setSelectedElements={setSelectedElements}
                      setNodeBotId={setNodeBotId}
                      nodeBotId={nodeBotId}
                      isNewNode={selectedElements[0]?.data?.isAdded}
                      reactFlowInstance={reactFlowInstance}
                      edges={edges}
                      nodes={nodes}
                      flowKey={flowKey}
                    />
                  )
                    : selectedElements[0]?.type === "paymentnode" ? (
                      <PaymentSidebar
                        dataUserId={dataUserId}
                        nodeName={nodeName}
                        setNodeName={setNodeName}
                        nodeId={nodeId}
                        webHookUrl={webHookUrl}
                        setWebHookUrl={setWebHookUrl}
                        nodeImage={nodeImage}
                        setNodeImage={setNodeImage}
                        nodeVideo={nodeVideo}
                        setNodeVideo={setNodeVideo}
                        nodeAudio={nodeAudio}
                        setNodeAudio={setNodeAudio}
                        nodeFile={nodeFile}
                        setNodeFile={setNodeFile}
                        nodeLink={nodeLink}
                        setNodeLink={setNodeLink}
                        nodeFooter1={nodeFooter1}
                        setNodeFooter1={setNodeFooter1}
                        nodeFooter2={nodeFooter2}
                        setNodeFooter2={setNodeFooter2}
                        nodeFooter3={nodeFooter3}
                        setNodeFooter3={setNodeFooter3}
                        selectedNode={selectedElements[0]}
                        setSelectedElements={setSelectedElements}
                        setNodeBotId={setNodeBotId}
                        nodeBotId={nodeBotId}
                        isNewNode={selectedElements[0]?.data?.isAdded}
                        reactFlowInstance={reactFlowInstance}
                        edges={edges}
                        nodes={nodes}
                        flowKey={flowKey}
                      />
                    )
                      : selectedElements[0]?.type === "aiProductNode" ? (
                        <AiProductSidebar
                          dataUserId={dataUserId}
                          nodeName={nodeName}
                          setNodeName={setNodeName}
                          nodeId={nodeId}
                          webHookUrl={webHookUrl}
                          setWebHookUrl={setWebHookUrl}
                          nodeImage={nodeImage}
                          setNodeImage={setNodeImage}
                          nodeVideo={nodeVideo}
                          setNodeVideo={setNodeVideo}
                          nodeAudio={nodeAudio}
                          setNodeAudio={setNodeAudio}
                          nodeFile={nodeFile}
                          setNodeFile={setNodeFile}
                          nodeLink={nodeLink}
                          setNodeLink={setNodeLink}
                          nodeFooter1={nodeFooter1}
                          setNodeFooter1={setNodeFooter1}
                          nodeFooter2={nodeFooter2}
                          setNodeFooter2={setNodeFooter2}
                          nodeFooter3={nodeFooter3}
                          setNodeFooter3={setNodeFooter3}
                          selectedNode={selectedElements[0]}
                          setSelectedElements={setSelectedElements}
                          setNodeBotId={setNodeBotId}
                          nodeBotId={nodeBotId}
                          isNewNode={selectedElements[0]?.data?.isAdded}
                          reactFlowInstance={reactFlowInstance}
                          edges={edges}
                          nodes={nodes}
                          flowKey={flowKey}
                        />
                      )
                        : selectedElements[0]?.type === "flowtemplatenode" ? (
                          <FlowTemplateSidebar
                            dataUserId={dataUserId}
                            nodeName={nodeName}
                            setNodeName={setNodeName}
                            nodeId={nodeId}
                            webHookUrl={webHookUrl}
                            setWebHookUrl={setWebHookUrl}
                            nodeImage={nodeImage}
                            setNodeImage={setNodeImage}
                            nodeVideo={nodeVideo}
                            setNodeVideo={setNodeVideo}
                            nodeAudio={nodeAudio}
                            setNodeAudio={setNodeAudio}
                            nodeFile={nodeFile}
                            setNodeFile={setNodeFile}
                            nodeLink={nodeLink}
                            setNodeLink={setNodeLink}
                            nodeFooter1={nodeFooter1}
                            setNodeFooter1={setNodeFooter1}
                            nodeFooter2={nodeFooter2}
                            setNodeFooter2={setNodeFooter2}
                            nodeFooter3={nodeFooter3}
                            setNodeFooter3={setNodeFooter3}
                            selectedNode={selectedElements[0]}
                            setSelectedElements={setSelectedElements}
                            setNodeBotId={setNodeBotId}
                            nodeBotId={nodeBotId}
                            isNewNode={selectedElements[0]?.data?.isAdded}
                            reactFlowInstance={reactFlowInstance}
                            edges={edges}
                            nodes={nodes}
                            flowKey={flowKey}
                          />
                        )
                          : selectedElements[0]?.type === "remindernode" ? (
                            <ReminderSidebar
                              dataUserId={dataUserId}
                              nodeName={nodeName}
                              setNodeName={setNodeName}
                              nodeId={nodeId}
                              webHookUrl={webHookUrl}
                              setWebHookUrl={setWebHookUrl}
                              nodeImage={nodeImage}
                              setNodeImage={setNodeImage}
                              nodeVideo={nodeVideo}
                              setNodeVideo={setNodeVideo}
                              nodeAudio={nodeAudio}
                              setNodeAudio={setNodeAudio}
                              nodeFile={nodeFile}
                              setNodeFile={setNodeFile}
                              nodeLink={nodeLink}
                              setNodeLink={setNodeLink}
                              nodeFooter1={nodeFooter1}
                              setNodeFooter1={setNodeFooter1}
                              nodeFooter2={nodeFooter2}
                              setNodeFooter2={setNodeFooter2}
                              nodeFooter3={nodeFooter3}
                              setNodeFooter3={setNodeFooter3}
                              selectedNode={selectedElements[0]}
                              setSelectedElements={setSelectedElements}
                              setNodeBotId={setNodeBotId}
                              nodeBotId={nodeBotId}
                              isNewNode={selectedElements[0]?.data?.isAdded}
                              reactFlowInstance={reactFlowInstance}
                              edges={edges}
                              nodes={nodes}
                              flowKey={flowKey}
                            />
                          )
                            : selectedElements[0]?.type === "businesshoursnode" ? (
                              <BusinessHoursSidebar
                                dataUserId={dataUserId}
                                nodeName={nodeName}
                                setNodeName={setNodeName}
                                nodeId={nodeId}
                                webHookUrl={webHookUrl}
                                setWebHookUrl={setWebHookUrl}
                                nodeImage={nodeImage}
                                setNodeImage={setNodeImage}
                                nodeVideo={nodeVideo}
                                setNodeVideo={setNodeVideo}
                                nodeAudio={nodeAudio}
                                setNodeAudio={setNodeAudio}
                                nodeFile={nodeFile}
                                setNodeFile={setNodeFile}
                                nodeLink={nodeLink}
                                setNodeLink={setNodeLink}
                                nodeFooter1={nodeFooter1}
                                setNodeFooter1={setNodeFooter1}
                                nodeFooter2={nodeFooter2}
                                setNodeFooter2={setNodeFooter2}
                                nodeFooter3={nodeFooter3}
                                setNodeFooter3={setNodeFooter3}
                                selectedNode={selectedElements[0]}
                                setSelectedElements={setSelectedElements}
                                setNodeBotId={setNodeBotId}
                                nodeBotId={nodeBotId}
                                isNewNode={selectedElements[0]?.data?.isAdded}
                                reactFlowInstance={reactFlowInstance}
                                edges={edges}
                                nodes={nodes}
                                flowKey={flowKey}
                              />
                            )
                              : selectedElements[0]?.type === "humantakeovernode" ? (
                                <HumanTakeOverSidebar
                                  dataUserId={dataUserId}
                                  nodeName={nodeName}
                                  setNodeName={setNodeName}
                                  nodeId={nodeId}
                                  webHookUrl={webHookUrl}
                                  setWebHookUrl={setWebHookUrl}
                                  nodeImage={nodeImage}
                                  setNodeImage={setNodeImage}
                                  nodeVideo={nodeVideo}
                                  setNodeVideo={setNodeVideo}
                                  nodeAudio={nodeAudio}
                                  setNodeAudio={setNodeAudio}
                                  nodeFile={nodeFile}
                                  setNodeFile={setNodeFile}
                                  nodeLink={nodeLink}
                                  setNodeLink={setNodeLink}
                                  nodeFooter1={nodeFooter1}
                                  setNodeFooter1={setNodeFooter1}
                                  nodeFooter2={nodeFooter2}
                                  setNodeFooter2={setNodeFooter2}
                                  nodeFooter3={nodeFooter3}
                                  setNodeFooter3={setNodeFooter3}
                                  selectedNode={selectedElements[0]}
                                  setSelectedElements={setSelectedElements}
                                  setNodeBotId={setNodeBotId}
                                  nodeBotId={nodeBotId}
                                  isNewNode={selectedElements[0]?.data?.isAdded}
                                  reactFlowInstance={reactFlowInstance}
                                  edges={edges}
                                  nodes={nodes}
                                  flowKey={flowKey}
                                />
                              )
                                : selectedElements[0]?.type === "catlognode" ? (
                                  <CatlogSidebar
                                    dataUserId={dataUserId}
                                    nodeName={nodeName}
                                    setNodeName={setNodeName}
                                    nodeId={nodeId}
                                    webHookUrl={webHookUrl}
                                    setWebHookUrl={setWebHookUrl}
                                    nodeImage={nodeImage}
                                    setNodeImage={setNodeImage}
                                    nodeVideo={nodeVideo}
                                    setNodeVideo={setNodeVideo}
                                    nodeAudio={nodeAudio}
                                    setNodeAudio={setNodeAudio}
                                    nodeFile={nodeFile}
                                    setNodeFile={setNodeFile}
                                    nodeLink={nodeLink}
                                    setNodeLink={setNodeLink}
                                    nodeFooter1={nodeFooter1}
                                    setNodeFooter1={setNodeFooter1}
                                    nodeFooter2={nodeFooter2}
                                    setNodeFooter2={setNodeFooter2}
                                    nodeFooter3={nodeFooter3}
                                    setNodeFooter3={setNodeFooter3}
                                    selectedNode={selectedElements[0]}
                                    setSelectedElements={setSelectedElements}
                                    setNodeBotId={setNodeBotId}
                                    nodeBotId={nodeBotId}
                                    isNewNode={selectedElements[0]?.data?.isAdded}
                                    reactFlowInstance={reactFlowInstance}
                                    edges={edges}
                                    nodes={nodes}
                                    flowKey={flowKey}
                                  />
                                )
                                  : selectedElements[0]?.type === "createordernode" ? (
                                    <CreateOrderSidebar
                                      dataUserId={dataUserId}
                                      nodeName={nodeName}
                                      setNodeName={setNodeName}
                                      nodeId={nodeId}
                                      webHookUrl={webHookUrl}
                                      setWebHookUrl={setWebHookUrl}
                                      nodeImage={nodeImage}
                                      setNodeImage={setNodeImage}
                                      nodeVideo={nodeVideo}
                                      setNodeVideo={setNodeVideo}
                                      nodeAudio={nodeAudio}
                                      setNodeAudio={setNodeAudio}
                                      nodeFile={nodeFile}
                                      setNodeFile={setNodeFile}
                                      nodeLink={nodeLink}
                                      setNodeLink={setNodeLink}
                                      nodeFooter1={nodeFooter1}
                                      setNodeFooter1={setNodeFooter1}
                                      nodeFooter2={nodeFooter2}
                                      setNodeFooter2={setNodeFooter2}
                                      nodeFooter3={nodeFooter3}
                                      setNodeFooter3={setNodeFooter3}
                                      selectedNode={selectedElements[0]}
                                      setSelectedElements={setSelectedElements}
                                      setNodeBotId={setNodeBotId}
                                      nodeBotId={nodeBotId}
                                      isNewNode={selectedElements[0]?.data?.isAdded}
                                      reactFlowInstance={reactFlowInstance}
                                      edges={edges}
                                      nodes={nodes}
                                      flowKey={flowKey}
                                    />
                                  )
                                    : selectedElements[0]?.type === "inactiveNode" ? (
                                      <InactiveSidebar
                                        dataUserId={dataUserId}
                                        nodeName={nodeName}
                                        setNodeName={setNodeName}
                                        nodeId={nodeId}
                                        webHookUrl={webHookUrl}
                                        setWebHookUrl={setWebHookUrl}
                                        nodeImage={nodeImage}
                                        setNodeImage={setNodeImage}
                                        nodeVideo={nodeVideo}
                                        setNodeVideo={setNodeVideo}
                                        nodeAudio={nodeAudio}
                                        setNodeAudio={setNodeAudio}
                                        nodeFile={nodeFile}
                                        setNodeFile={setNodeFile}
                                        nodeLink={nodeLink}
                                        setNodeLink={setNodeLink}
                                        nodeFooter1={nodeFooter1}
                                        setNodeFooter1={setNodeFooter1}
                                        nodeFooter2={nodeFooter2}
                                        setNodeFooter2={setNodeFooter2}
                                        nodeFooter3={nodeFooter3}
                                        setNodeFooter3={setNodeFooter3}
                                        selectedNode={selectedElements[0]}
                                        setSelectedElements={setSelectedElements}
                                        setNodeBotId={setNodeBotId}
                                        nodeBotId={nodeBotId}
                                        isNewNode={selectedElements[0]?.data?.isAdded}
                                        reactFlowInstance={reactFlowInstance}
                                        edges={edges}
                                        nodes={nodes}
                                        flowKey={flowKey}
                                      />
                                    )
                                      : selectedElements[0]?.type === "apirequestnode" ? (
                                        <ApiRequestSidebar
                                          dataUserId={dataUserId}
                                          nodeName={nodeName}
                                          setNodeName={setNodeName}
                                          nodeId={nodeId}
                                          nodeImage={nodeImage}
                                          setNodeImage={setNodeImage}
                                          nodeVideo={nodeVideo}
                                          setNodeVideo={setNodeVideo}
                                          nodeAudio={nodeAudio}
                                          setNodeAudio={setNodeAudio}
                                          nodeFile={nodeFile}
                                          setNodeFile={setNodeFile}
                                          nodeLink={nodeLink}
                                          setNodeLink={setNodeLink}
                                          nodeFooter1={nodeFooter1}
                                          setNodeFooter1={setNodeFooter1}
                                          nodeFooter2={nodeFooter2}
                                          setNodeFooter2={setNodeFooter2}
                                          nodeFooter3={nodeFooter3}
                                          setNodeFooter3={setNodeFooter3}
                                          selectedNode={selectedElements[0]}
                                          setSelectedElements={setSelectedElements}
                                          setNodeBotId={setNodeBotId}
                                          nodeBotId={nodeBotId}
                                          isNewNode={selectedElements[0]?.data?.isAdded}
                                          reactFlowInstance={reactFlowInstance}
                                          edges={edges}
                                          nodes={nodes}
                                          flowKey={flowKey}
                                        />
                                      )
                                        : selectedElements[0]?.type === "conditionrouternode" ? (
                                          <ConditionRouterSidebar
                                            dataUserId={dataUserId}
                                            nodeName={nodeName}
                                            setNodeName={setNodeName}
                                            nodeId={nodeId}
                                            nodeImage={nodeImage}
                                            setNodeImage={setNodeImage}
                                            nodeVideo={nodeVideo}
                                            setNodeVideo={setNodeVideo}
                                            nodeAudio={nodeAudio}
                                            setNodeAudio={setNodeAudio}
                                            nodeFile={nodeFile}
                                            setNodeFile={setNodeFile}
                                            nodeLink={nodeLink}
                                            setNodeLink={setNodeLink}
                                            nodeFooter1={nodeFooter1}
                                            setNodeFooter1={setNodeFooter1}
                                            nodeFooter2={nodeFooter2}
                                            setNodeFooter2={setNodeFooter2}
                                            nodeFooter3={nodeFooter3}
                                            setNodeFooter3={setNodeFooter3}
                                            selectedNode={selectedElements[0]}
                                            setSelectedElements={setSelectedElements}
                                            setNodeBotId={setNodeBotId}
                                            nodeBotId={nodeBotId}
                                            isNewNode={selectedElements[0]?.data?.isAdded}
                                            reactFlowInstance={reactFlowInstance}
                                            edges={edges}
                                            nodes={nodes}
                                            flowKey={flowKey}
                                          />
                                        )
                                        : selectedElements[0]?.type === "pincodenode" ? (
                                          <PincodeSidebar
                                            dataUserId={dataUserId}
                                            nodeName={nodeName}
                                            setNodeName={setNodeName}
                                            nodeId={nodeId}
                                            nodeImage={nodeImage}
                                            setNodeImage={setNodeImage}
                                            nodeVideo={nodeVideo}
                                            setNodeVideo={setNodeVideo}
                                            nodeAudio={nodeAudio}
                                            setNodeAudio={setNodeAudio}
                                            nodeFile={nodeFile}
                                            setNodeFile={setNodeFile}
                                            nodeLink={nodeLink}
                                            setNodeLink={setNodeLink}
                                            nodeFooter1={nodeFooter1}
                                            setNodeFooter1={setNodeFooter1}
                                            nodeFooter2={nodeFooter2}
                                            setWebHookUrl={setWebHookUrl}
                                            setNodeFooter2={setNodeFooter2}
                                            nodeFooter3={nodeFooter3}
                                            setNodeFooter3={setNodeFooter3}
                                            selectedNode={selectedElements[0]}
                                            setSelectedElements={setSelectedElements}
                                            setNodeBotId={setNodeBotId}
                                            nodeBotId={nodeBotId}
                                            isNewNode={selectedElements[0]?.data?.isAdded}
                                            reactFlowInstance={reactFlowInstance}
                                            edges={edges}
                                            nodes={nodes}
                                            flowKey={flowKey}
                                          />
                                        )
                                          : (
                                            <AdvanceSideBar
                                              dataUserId={dataUserId}
                                              nodeName={nodeName}
                                              setNodeName={setNodeName}
                                              nodeId={nodeId}
                                              webHookUrl={webHookUrl}
                                              setWebHookUrl={setWebHookUrl}
                                              footerText={footerText}
                                              setFooterText={setFooterText}
                                              nodeImage={nodeImage}
                                              setNodeImage={setNodeImage}
                                              nodeCaption={nodeCaption}
                                              setNodeCaption={setNodeCaption}
                                              nodeVideo={nodeVideo}
                                              setNodeVideo={setNodeVideo}
                                              nodeAudio={nodeAudio}
                                              setNodeAudio={setNodeAudio}
                                              nodeFile={nodeFile}
                                              setNodeFile={setNodeFile}
                                              nodeLink={nodeLink}
                                              setNodeLink={setNodeLink}
                                              nodeCta={nodeCta}
                                              setNodeCta={setNodeCta}
                                              nodeCtaButton={nodeCtaButton}
                                              setNodeCtaButton={setNodeCtaButton}
                                              nodeButtons={nodeButtons}
                                              setNodeButtons={setNodeButtons}
                                              nodeButton1={nodeButton1}
                                              setNodeButton1={setNodeButton1}
                                              nodeButton2={nodeButton2}
                                              setNodeButton2={setNodeButton2}
                                              nodeButton3={nodeButton3}
                                              setNodeButton3={setNodeButton3}
                                              nodeFooter1={nodeFooter1}
                                              setNodeFooter1={setNodeFooter1}
                                              nodeFooter2={nodeFooter2}
                                              setNodeFooter2={setNodeFooter2}
                                              nodeFooter3={nodeFooter3}
                                              setNodeFooter3={setNodeFooter3}
                                              selectedNode={selectedElements[0]}
                                              setSelectedElements={setSelectedElements}
                                              isNewNode={selectedElements[0]?.data?.isAdded}
                                              reactFlowInstance={reactFlowInstance}
                                              edges={edges}
                                              nodes={nodes}
                                              flowKey={flowKey}
                                            />
                                          )}
    </div>
  );
};

// Wrap App with ReactFlowProvider chat bot UI
function FlowWithProvider() {
  return (
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  );
}

export default FlowWithProvider;
