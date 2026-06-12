// import React, { useEffect, useRef, useState } from "react"
// import io from "socket.io-client"

// const socket = io("https://ybt.8f5.mytemp.website/webrtc")

// const configuration = {
//   iceServers: [
//     { urls: "stun:stun.l.google.com:19302" }
//   ]
// }

// export default function AudioRoom() {

//   const localStream = useRef()
//   const peers = useRef({})
//   const [users, setUsers] = useState([])
//   const [isConnected, setIsConnected] = useState(false)
//   const listenersSetup = useRef(false)
//   const audioElements = useRef({})
//   const [roomId, setRoomId] = useState("")
//   const [currentRoom, setCurrentRoom] = useState("")

//   useEffect(() => {
//     // Don't auto-start, wait for user to join a room
//     return () => {
//       // Cleanup on unmount
//       Object.values(peers.current).forEach(pc => pc.close())
//       peers.current = {}
//       Object.values(audioElements.current).forEach(audio => {
//         audio.pause()
//         audio.srcObject = null
//       })
//       audioElements.current = {}
//       socket.off("all-users")
//       socket.off("user-joined")
//       socket.off("user-left")
//       socket.off("offer")
//       socket.off("answer")
//       socket.off("ice-candidate")
//     }

//   }, [])

//   async function start() {

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: true
//       })

//       localStream.current = stream

//       // Add local audio to page for testing
//       const localAudio = document.createElement("audio")
//       localAudio.srcObject = stream
//       localAudio.autoplay = true
//       localAudio.muted = true // Mute local audio to avoid echo
//       localAudio.id = "local-audio"
//       document.body.appendChild(localAudio)

//       socket.emit("join-room", currentRoom)
//       setIsConnected(true)

//       if (!listenersSetup.current) {
//         setupSocketListeners()
//         listenersSetup.current = true
//       }

//     } catch (error) {
//       console.error("Error accessing microphone:", error)
//       alert("Microphone access is required for audio calls. Please grant permission and ensure a microphone is connected.")
//     }

//   }

//   function generateRoomId() {
//     return Math.random().toString(36).substring(2, 8).toUpperCase()
//   }

//   async function createRoom() {
//     const newRoomId = generateRoomId()
//     setRoomId(newRoomId)
//     await joinRoom()
//   }

//   async function joinRoom() {
//     if (!roomId.trim()) {
//       alert("Please enter a room ID")
//       return
//     }

//     // Leave current room if in one
//     if (currentRoom) {
//       await leaveRoom()
//     }

//     setCurrentRoom(roomId.trim())
    
//     // Start will be called after currentRoom is set
//     setTimeout(() => {
//       start()
//     }, 100)
//   }

//   async function leaveRoom() {
//     // Clean up existing connections
//     Object.values(peers.current).forEach(pc => pc.close())
//     peers.current = {}
    
//     Object.values(audioElements.current).forEach(audio => {
//       audio.pause()
//       audio.srcObject = null
//       document.body.removeChild(audio)
//     })
//     audioElements.current = {}
    
//     setUsers([])
//     setIsConnected(false)
    
//     if (currentRoom) {
//       socket.emit("leave-room", currentRoom)
//     }
//   }

//   function setupSocketListeners() {
//     socket.on("all-users", (users) => {
//       console.log("Received all-users:", users)
//       // Set users only once, removing any duplicates
//       const uniqueUsers = [...new Set(users)]
//       setUsers(uniqueUsers)
//       uniqueUsers.forEach(async userId => {

//         const pc = createPeer(userId)

//         peers.current[userId] = pc

//         const offer = await pc.createOffer()

//         await pc.setLocalDescription(offer)

//         socket.emit("offer", {
//           target: userId,
//           sdp: offer
//         })

//       })

//     })

//     socket.on("user-joined", (userId) => {
//       setUsers(prev => {
//         if (!prev.includes(userId)) {
//           return [...prev, userId]
//         }
//         return prev
//       })
//     })

//     socket.on("user-left", (userId) => {
//       setUsers(prev => prev.filter(id => id !== userId))
//       if (peers.current[userId]) {
//         peers.current[userId].close()
//         delete peers.current[userId]
//       }
//       if (audioElements.current[userId]) {
//         audioElements.current[userId].pause()
//         audioElements.current[userId].srcObject = null
//         document.body.removeChild(audioElements.current[userId])
//         delete audioElements.current[userId]
//       }
//     })

//     socket.on("offer", async ({ caller, sdp }) => {

//       const pc = createPeer(caller)

//       peers.current[caller] = pc

//       await pc.setRemoteDescription(new RTCSessionDescription(sdp))

//       const answer = await pc.createAnswer()

//       await pc.setLocalDescription(answer)

//       socket.emit("answer", {
//         target: caller,
//         sdp: answer
//       })

//     })

//     socket.on("answer", async ({ caller, sdp }) => {

//       const pc = peers.current[caller]

//       await pc.setRemoteDescription(new RTCSessionDescription(sdp))

//     })

//     socket.on("ice-candidate", async ({ caller, candidate }) => {

//       const pc = peers.current[caller]

//       await pc.addIceCandidate(new RTCIceCandidate(candidate))

//     })
//   }

//   function createPeer(userId) {

//     const pc = new RTCPeerConnection(configuration)

//     localStream.current.getTracks().forEach(track => {
//       pc.addTrack(track, localStream.current)
//     })

//     pc.ontrack = (event) => {
//       console.log("Received remote track from", userId, event.streams[0])
      
//       // Remove existing audio element for this user if it exists
//       if (audioElements.current[userId]) {
//         audioElements.current[userId].pause()
//         audioElements.current[userId].srcObject = null
//         document.body.removeChild(audioElements.current[userId])
//       }
      
//       const audio = document.createElement("audio")
//       audio.srcObject = event.streams[0]
//       audio.autoplay = true
//       audio.id = `remote-audio-${userId}`
      
//       document.body.appendChild(audio)
//       audioElements.current[userId] = audio
      
//       console.log("Added audio element for user", userId)
//     }

//     pc.onicecandidate = (event) => {

//       if (event.candidate) {

//         socket.emit("ice-candidate", {
//           target: userId,
//           candidate: event.candidate
//         })

//       }

//     }

//     return pc

//   }

//   return (
//     <div>
//       <div style={{ padding: '20px' }}>
//         <h3>Audio Room</h3>
        
//         {!currentRoom ? (
//           <div style={{ marginBottom: '20px' }}>
//             <div style={{ marginBottom: '10px' }}>
//               <strong>Join a Room:</strong>
//             </div>
//             <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
//               <input
//                 type="text"
//                 value={roomId}
//                 onChange={(e) => setRoomId(e.target.value)}
//                 placeholder="Enter room ID"
//                 onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
//                 style={{ 
//                   padding: '8px', 
//                   border: '1px solid #ccc', 
//                   borderRadius: '4px',
//                   minWidth: '200px'
//                 }}
//               />
//               <button 
//                 onClick={joinRoom}
//                 style={{ 
//                   padding: '8px 16px', 
//                   backgroundColor: '#007bff', 
//                   color: 'white', 
//                   border: 'none', 
//                   borderRadius: '4px',
//                   cursor: 'pointer'
//                 }}
//               >
//                 Join Room
//               </button>
//               <button 
//                 onClick={createRoom}
//                 style={{ 
//                   padding: '8px 16px', 
//                   backgroundColor: '#28a745', 
//                   color: 'white', 
//                   border: 'none', 
//                   borderRadius: '4px',
//                   cursor: 'pointer'
//                 }}
//               >
//                 Create Room
//               </button>
//             </div>
//             <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
//               Enter any room ID to create or join a room
//             </p>
//           </div>
//         ) : (
//           <div>
//             <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <div>
//                 <strong>Room ID:</strong> {currentRoom}
//               </div>
//               <button 
//                 onClick={leaveRoom}
//                 style={{ 
//                   padding: '6px 12px', 
//                   backgroundColor: '#dc3545', 
//                   color: 'white', 
//                   border: 'none', 
//                   borderRadius: '4px',
//                   cursor: 'pointer'
//                 }}
//               >
//                 Leave Room
//               </button>
//             </div>
            
//             <div style={{ marginBottom: '15px' }}>
//               <strong>Connection:</strong> 
//               <span style={{ color: isConnected ? 'green' : 'red', marginLeft: '10px' }}>
//                 {isConnected ? 'Connected' : 'Disconnected'}
//               </span>
//             </div>
            
//             <div style={{ marginBottom: '15px' }}>
//               <strong>Users in room ({users.length + 1}):</strong>
//               <ul style={{ marginTop: '10px' }}>
//                 <li>You (Host) - Local audio: ✓</li>
//                 {users.map(userId => (
//                   <li key={userId}>
//                     User {userId.slice(-6)} - 
//                     <span style={{ color: audioElements.current[userId] ? 'green' : 'orange' }}>
//                       {audioElements.current[userId] ? ' Audio connected' : ' Connecting...'}
//                     </span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
            
//             <div style={{ marginBottom: '15px' }}>
//               <strong>Debug Info:</strong>
//               <ul style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
//                 <li>Local stream: {localStream.current ? 'Active' : 'Not set'}</li>
//                 <li>Audio elements: {Object.keys(audioElements.current).length}</li>
//                 <li>Peer connections: {Object.keys(peers.current).length}</li>
//               </ul>
//             </div>
            
//             <p style={{ color: '#666' }}>
//               Share this room ID with others to join: <strong>{currentRoom}</strong>
//             </p>
            
//             <button 
//               onClick={() => console.log('Debug state:', {
//                 users,
//                 audioElements: Object.keys(audioElements.current),
//                 peers: Object.keys(peers.current),
//                 localStream: !!localStream.current,
//                 currentRoom
//               })}
//               style={{ marginTop: '10px', padding: '5px 10px' }}
//             >
//               Debug Console
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   )

// }