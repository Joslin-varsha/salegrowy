import React, { useState, useRef, useEffect } from "react";
import { Phone, PhoneCall, Copy, Check, Users, Mic, MicOff, PhoneOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../automation/components/ui/dialog";
import io from "socket.io-client";

// const socket = io("http://localhost:5000");

// const configuration = {
//   iceServers: [
//     { urls: "stun:stun.l.google.com:19302" }
//   ]
// };

export default function AudioCallButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [callToken, setCallToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const localStream = useRef();
  const peers = useRef({});
  const audioElements = useRef({});
  const listenersSetup = useRef(false);

  const generateWhatsAppCallToken = () => {
    // Generate a unique call token for WhatsApp call
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const token = `WA_CALL_${timestamp}_${randomId}`;
    setCallToken(token);
    return token;
  };

  return null;
}

  // const createWhatsAppCall = async () => {
  //   const token = generateWhatsAppCallToken();
    
  //   // Create WhatsApp call link with token
  //   const phoneNumber = "1234567890"; // You can make this dynamic
  //   const message = `Join my audio call with token: ${token}`;
    
  //   // Try multiple WhatsApp URL formats for better compatibility
  //   const whatsappUrl1 = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  //   const whatsappUrl2 = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
  //   const whatsappUrl3 = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
  //   // Try to open WhatsApp app first, then web version as fallback


  //   // Start the audio call room
  //   await startCallRoom(token);
  // };

  // const startCallRoom = async (token) => {
  //   try {
  //     setIsConnecting(true);
      
  //     // Get microphone access
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       audio: true
  //     });
      
  //     localStream.current = stream;
      
  //     // Add local audio to page
  //     const localAudio = document.createElement("audio");
  //     localAudio.srcObject = stream;
  //     localAudio.autoplay = true;
  //     localAudio.muted = true; // Mute local audio to avoid echo
  //     localAudio.id = "local-audio";
  //     document.body.appendChild(localAudio);
      
  //     // Join the call room with token
  //     socket.emit("join-room", token);
  //     setIsInCall(true);
      
  //     if (!listenersSetup.current) {
  //       setupSocketListeners();
  //       listenersSetup.current = true;
  //     }
      
  //   } catch (error) {
  //     console.error("Error starting call:", error);
  //     alert("Microphone access is required for audio calls. Please grant permission and ensure a microphone is connected.");
  //   } finally {
  //     setIsConnecting(false);
  //   }
  // };

  // const toggleMute = () => {
  //   if (localStream.current) {
  //     const audioTracks = localStream.current.getAudioTracks();
  //     audioTracks.forEach(track => {
  //       track.enabled = !track.enabled;
  //     });
  //     setIsMuted(!isMuted);
  //   }
  // };

  // const endCall = () => {
  //   // Clean up existing connections
  //   Object.values(peers.current).forEach(pc => pc.close());
  //   peers.current = {};
    
  //   Object.values(audioElements.current).forEach(audio => {
  //     audio.pause();
  //     audio.srcObject = null;
  //     if (document.body.contains(audio)) {
  //       document.body.removeChild(audio);
  //     }
  //   });
  //   audioElements.current = {};
    
  //   if (localStream.current) {
  //     localStream.current.getTracks().forEach(track => track.stop());
  //   }
    
  //   if (document.body.contains(document.getElementById("local-audio"))) {
  //     document.body.removeChild(document.getElementById("local-audio"));
  //   }
    
  //   setConnectedUsers([]);
  //   setIsInCall(false);
  //   setIsMuted(false);
    
  //   if (callToken) {
  //     socket.emit("leave-room", callToken);
  //   }
  // };

  // const setupSocketListeners = () => {
  //   socket.on("all-users", (users) => {
  //     console.log("Received all-users:", users);
  //     const uniqueUsers = [...new Set(users)];
  //     setConnectedUsers(uniqueUsers);
      
  //     uniqueUsers.forEach(async userId => {
  //       const pc = createPeer(userId);
  //       peers.current[userId] = pc;
        
  //       const offer = await pc.createOffer();
  //       await pc.setLocalDescription(offer);
        
  //       socket.emit("offer", {
  //         target: userId,
  //         sdp: offer
  //       });
  //     });
  //   });

  //   socket.on("user-joined", (userId) => {
  //     setConnectedUsers(prev => {
  //       if (!prev.includes(userId)) {
  //         return [...prev, userId];
  //       }
  //       return prev;
  //     });
  //   });

  //   socket.on("user-left", (userId) => {
  //     setConnectedUsers(prev => prev.filter(id => id !== userId));
  //     if (peers.current[userId]) {
  //       peers.current[userId].close();
  //       delete peers.current[userId];
  //     }
  //     if (audioElements.current[userId]) {
  //       audioElements.current[userId].pause();
  //       audioElements.current[userId].srcObject = null;
  //       if (document.body.contains(audioElements.current[userId])) {
  //         document.body.removeChild(audioElements.current[userId]);
  //       }
  //       delete audioElements.current[userId];
  //     }
  //   });

  //   socket.on("offer", async ({ caller, sdp }) => {
  //     const pc = createPeer(caller);
  //     peers.current[caller] = pc;
      
  //     await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  //     const answer = await pc.createAnswer();
  //     await pc.setLocalDescription(answer);
      
  //     socket.emit("answer", {
  //       target: caller,
  //       sdp: answer
  //     });
  //   });

  //   socket.on("answer", async ({ caller, sdp }) => {
  //     const pc = peers.current[caller];
  //     await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  //   });

  //   socket.on("ice-candidate", async ({ caller, candidate }) => {
  //     const pc = peers.current[caller];
  //     await pc.addIceCandidate(new RTCIceCandidate(candidate));
  //   });
  // };

  // const createPeer = (userId) => {
  //   const pc = new RTCPeerConnection(configuration);
    
  //   localStream.current.getTracks().forEach(track => {
  //     pc.addTrack(track, localStream.current);
  //   });
    
  //   pc.ontrack = (event) => {
  //     console.log("Received remote track from", userId, event.streams[0]);
      
  //     // Remove existing audio element for this user if it exists
  //     if (audioElements.current[userId]) {
  //       audioElements.current[userId].pause();
  //       audioElements.current[userId].srcObject = null;
  //       if (document.body.contains(audioElements.current[userId])) {
  //         document.body.removeChild(audioElements.current[userId]);
  //       }
  //     }
      
  //     const audio = document.createElement("audio");
  //     audio.srcObject = event.streams[0];
  //     audio.autoplay = true;
  //     audio.id = `remote-audio-${userId}`;
      
  //     document.body.appendChild(audio);
  //     audioElements.current[userId] = audio;
      
  //     console.log("Added audio element for user", userId);
  //   };
    
  //   pc.onicecandidate = (event) => {
  //     if (event.candidate) {
  //       socket.emit("ice-candidate", {
  //         target: userId,
  //         candidate: event.candidate
  //       });
  //     }
  //   };
    
  //   return pc;
  // };

  // useEffect(() => {
  //   return () => {
  //     // Cleanup on unmount
  //     endCall();
  //     socket.off("all-users");
  //     socket.off("user-joined");
  //     socket.off("user-left");
  //     socket.off("offer");
  //     socket.off("answer");
  //     socket.off("ice-candidate");
  //   };
  // }, []);

  // const copyToken = () => {
  //   if (callToken) {
  //     navigator.clipboard.writeText(callToken);
  //     setCopied(true);
  //     setTimeout(() => setCopied(false), 2000);
  //   }
  // };

  // const handleButtonClick = () => {
  //   createWhatsAppCall();
  //   setIsOpen(true);
  // };

  // return (
  //   <Dialog open={isOpen} onOpenChange={setIsOpen}>
  //     <DialogTrigger asChild>
  //       <button 
  //         onClick={handleButtonClick}
  //         className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:shadow-lg hover:scale-105 bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white shadow-md"
  //       >
  //         <Phone className="w-4 h-4" />
  //         <span>Call Now</span>
  //       </button>
  //     </DialogTrigger>
  //     <DialogContent className="max-w-lg">
  //       <DialogHeader>
  //         <DialogTitle className="flex items-center gap-2">
  //           {isInCall ? (
  //             <>
  //               <PhoneCall className="w-5 h-5 text-green-600" />
  //               Audio Call in Progress
  //             </>
  //           ) : (
  //             <>
  //               <PhoneCall className="w-5 h-5" />
  //               WhatsApp Call Created
  //             </>
  //           )}
  //         </DialogTitle>
  //       </DialogHeader>
        
  //       <div className="space-y-4">
  //         {!isInCall ? (
  //           <>
  //             <div className="bg-green-50 border border-green-200 rounded-lg p-4">
  //               <p className="text-sm text-green-800 font-medium mb-2">
  //                 ✅ Call token generated successfully!
  //               </p>
  //               <p className="text-xs text-green-700">
  //                 WhatsApp has been opened with the call invitation. The recipient can join using the token below.
  //               </p>
  //             </div>
              
  //             <div className="space-y-2">
  //               <label className="text-sm font-medium text-gray-700">Call Token:</label>
  //               <div className="flex items-center gap-2">
  //                 <div className="flex-1 bg-gray-100 border border-gray-300 rounded-md px-3 py-2 font-mono text-sm">
  //                   {callToken || "Generating..."}
  //                 </div>
  //                 <button
  //                   onClick={copyToken}
  //                   className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
  //                   disabled={!callToken}
  //                 >
  //                   {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
  //                 </button>
  //               </div>
  //               {copied && (
  //                 <p className="text-xs text-green-600">Token copied to clipboard!</p>
  //               )}
  //             </div>
              
  //             {isConnecting && (
  //               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
  //                 <p className="text-sm text-blue-800 font-medium">
  //                   🔄 Connecting to call room...
  //                 </p>
  //               </div>
  //             )}
              
  //             <div className="text-xs text-gray-500 space-y-1">
  //               <p>• Share this token with the person you want to call</p>
  //               <p>• They can join by entering this token in their audio room</p>
  //               <p>• Token expires after 24 hours</p>
  //             </div>
  //           </>
  //         ) : (
  //           <>
  //             {/* Active Call Interface */}
  //             <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
  //               <div className="text-center space-y-4">
  //                 <div className="flex justify-center">
  //                   <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
  //                     <PhoneCall className="w-8 h-8 text-white" />
  //                   </div>
  //                 </div>
                  
  //                 <div>
  //                   <p className="text-lg font-semibold text-gray-800">Call Active</p>
  //                   <p className="text-sm text-gray-600">Token: {callToken}</p>
  //                 </div>
                  
  //                 <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
  //                   <Users className="w-4 h-4" />
  //                   <span>{connectedUsers.length + 1} participant{connectedUsers.length !== 0 ? 's' : ''}</span>
  //                 </div>
  //               </div>
  //             </div>
              
  //             {/* Connected Users */}
  //             {connectedUsers.length > 0 && (
  //               <div className="space-y-2">
  //                 <label className="text-sm font-medium text-gray-700">Participants:</label>
  //                 <div className="space-y-1">
  //                   <div className="flex items-center gap-2 text-sm text-gray-600">
  //                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
  //                     <span>You (Host)</span>
  //                   </div>
  //                   {connectedUsers.map(userId => (
  //                     <div key={userId} className="flex items-center gap-2 text-sm text-gray-600">
  //                       <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
  //                       <span>User {userId.slice(-6)}</span>
  //                       <span className="text-xs text-green-600">• Connected</span>
  //                     </div>
  //                   ))}
  //                 </div>
  //               </div>
  //             )}
              
  //             {/* Call Controls */}
  //             <div className="flex justify-center gap-4 pt-4">
  //               <button
  //                 onClick={toggleMute}
  //                 className={`p-3 rounded-full transition-colors ${
  //                   isMuted 
  //                     ? 'bg-red-500 hover:bg-red-600 text-white' 
  //                     : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  //                 }`}
  //               >
  //                 {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
  //               </button>
                
  //               <button
  //                 onClick={endCall}
  //                 className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
  //               >
  //                 <PhoneOff className="w-5 h-5" />
  //               </button>
  //             </div>
  //           </>
  //         )}
  //       </div>
  //     </DialogContent>
  //   </Dialog>
  // );
  // }
