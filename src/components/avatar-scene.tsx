"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { Badge } from "@/components/ui/badge"
import { Loader2, Brain, Mic } from "lucide-react"

type Emotion = "happy" | "sad" | "angry" | "surprised" | "neutral"

interface AvatarSceneProps {
  isSpeaking: boolean
  isListening: boolean
  isThinking: boolean
  emotion: Emotion
}

export function AvatarScene({ isSpeaking, isListening, isThinking, emotion }: AvatarSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const avatarRef = useRef<THREE.Group | null>(null)
  const headRef = useRef<THREE.Mesh | null>(null)
  const leftEarRef = useRef<THREE.Group | null>(null)
  const rightEarRef = useRef<THREE.Group | null>(null)
  const leftEyeRef = useRef<THREE.Group | null>(null)
  const rightEyeRef = useRef<THREE.Group | null>(null)
  const leftEyebrowRef = useRef<THREE.Mesh | null>(null)
  const rightEyebrowRef = useRef<THREE.Mesh | null>(null)
  const snoutRef = useRef<THREE.Group | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const timeRef = useRef<number>(0)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  
  const stateRef = useRef({ isSpeaking, isListening, isThinking, emotion })
  const prevStateRef = useRef({ isSpeaking, isListening, isThinking, emotion })

  useEffect(() => {
    stateRef.current = { isSpeaking, isListening, isThinking, emotion }
  }, [isSpeaking, isListening, isThinking, emotion])

  useEffect(() => {
    prevStateRef.current = { isSpeaking, isListening, isThinking, emotion }
  }, [])

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f8ff) // Alice blue background
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      40,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.set(0, 0, 6)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer
    
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild)
    }
    
    mountRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.6)
    mainLight.position.set(3, 3, 5)
    mainLight.castShadow = true
    scene.add(mainLight)

    const fillLight = new THREE.DirectionalLight(0xb3d9ff, 0.3)
    fillLight.position.set(-3, 2, 3)
    scene.add(fillLight)

    // Create cute llama face
    const llamaFace = createCuteLlamaFace()
    avatarRef.current = llamaFace
    scene.add(llamaFace)

    // Store references
    headRef.current = llamaFace.getObjectByName("head") as THREE.Mesh
    leftEarRef.current = llamaFace.getObjectByName("leftEar") as THREE.Group
    rightEarRef.current = llamaFace.getObjectByName("rightEar") as THREE.Group
    leftEyeRef.current = llamaFace.getObjectByName("leftEye") as THREE.Group
    rightEyeRef.current = llamaFace.getObjectByName("rightEye") as THREE.Group
    leftEyebrowRef.current = llamaFace.getObjectByName("leftEyebrow") as THREE.Mesh
    rightEyebrowRef.current = llamaFace.getObjectByName("rightEyebrow") as THREE.Mesh
    snoutRef.current = llamaFace.getObjectByName("snout") as THREE.Group

    // Animation loop
    let lastTime = performance.now()
    let animationRunning = true
    
    const animate = (currentTime: number) => {
      if (!animationRunning) return
      
      animationFrameRef.current = requestAnimationFrame(animate)
      
      const deltaTime = (currentTime - lastTime) / 1000
      lastTime = currentTime
      timeRef.current += deltaTime

      const { isSpeaking, isListening, isThinking, emotion } = stateRef.current
      const prevState = prevStateRef.current

      // Reset eye position when conversation ends (isThinking or isSpeaking changes from true to false)
      if (leftEyeRef.current && rightEyeRef.current) {
        const leftEye = leftEyeRef.current
        const rightEye = rightEyeRef.current
        
        if ((prevState.isThinking && !isThinking) || (prevState.isSpeaking && !isSpeaking)) {
          // Reset eye positions to initial values
          leftEye.position.x = -0.4
          rightEye.position.x = 0.4
        }
      }

      // Update previous state
      prevStateRef.current = { isSpeaking, isListening, isThinking, emotion }

      if (avatarRef.current) {
        const time = timeRef.current
        const head = headRef.current
        const leftEar = leftEarRef.current
        const rightEar = rightEarRef.current
        const leftEye = leftEyeRef.current
        const rightEye = rightEyeRef.current
        const leftEyebrow = leftEyebrowRef.current
        const rightEyebrow = rightEyebrowRef.current
        const snout = snoutRef.current

        // Apply emotion-based eyebrow adjustments
        const applyEmotionEyebrows = () => {
          if (!leftEyebrow || !rightEyebrow) return

          switch (emotion) {
            case "happy":
              // Happy: cheerful arched eyebrows (more expressive and joyful)
              leftEyebrow.rotation.z = -0.55
              leftEyebrow.position.y = 0.83
              rightEyebrow.rotation.z = 0.55
              rightEyebrow.position.y = 0.83
              break
            case "sad":
              // Sad: lowered eyebrows (inner corners down)
              leftEyebrow.rotation.z = 0.2
              leftEyebrow.position.y = 0.72
              rightEyebrow.rotation.z = -0.2
              rightEyebrow.position.y = 0.72
              break
            case "angry":
              // Angry: raised eyebrows
              leftEyebrow.rotation.z = -0.4
              leftEyebrow.position.y = 0.80
              rightEyebrow.rotation.z = 0.4
              rightEyebrow.position.y = 0.80
              break
            case "surprised":
              // Surprised: very raised eyebrows
              leftEyebrow.rotation.z = -0.5
              leftEyebrow.position.y = 0.82
              rightEyebrow.rotation.z = 0.5
              rightEyebrow.position.y = 0.82
              break
            case "neutral":
            default:
              // Neutral: default position
              leftEyebrow.rotation.z = -0.1
              leftEyebrow.position.y = 0.75
              rightEyebrow.rotation.z = 0.1
              rightEyebrow.position.y = 0.75
              break
          }
        }

        // Apply emotion-based eye adjustments
        const applyEmotionEyes = () => {
          if (!leftEye || !rightEye) return

          switch (emotion) {
            case "surprised":
              // Surprised: smaller eyes (squinting)
              leftEye.scale.set(0.6, 0.6, 0.6)
              rightEye.scale.set(0.6, 0.6, 0.6)
              break
            default:
              // Other emotions: don't override state-based eye sizes
              break
          }
        }

        // Gentle breathing
        const breathing = Math.sin(time * 1.5) * 0.02
        if (head) {
          head.scale.y = 1 + breathing
          head.scale.x = 1 - breathing * 0.5
        }

        // Reset rotations
        avatarRef.current.rotation.x = 0
        avatarRef.current.rotation.y = 0
        avatarRef.current.rotation.z = 0

        if (leftEar) {
          leftEar.rotation.z = 0
          leftEar.rotation.x = 0
        }
        if (rightEar) {
          rightEar.rotation.z = 0
          rightEar.rotation.x = 0
        }

        // Eye scale (for blinking) - reset to default
        if (leftEye && leftEye.children[0]) (leftEye.children[0] as THREE.Mesh).scale.y = 1
        if (rightEye && rightEye.children[0]) (rightEye.children[0] as THREE.Mesh).scale.y = 1

        if (snout) {
          snout.scale.y = 1
          snout.rotation.z = 0
        }

        // Apply animations based on state
        if (isSpeaking) {
          // Speaking animation - head bobbing and expressive
          avatarRef.current.rotation.y = Math.sin(time * 3) * 0.1
          avatarRef.current.rotation.z = Math.sin(time * 4) * 0.05
          
          // Ears bouncing
          if (leftEar) {
            leftEar.rotation.z = Math.sin(time * 6) * 0.1
            leftEar.rotation.x = Math.sin(time * 5) * 0.1
          }
          if (rightEar) {
            rightEar.rotation.z = Math.sin(time * 6 + Math.PI) * 0.1
            rightEar.rotation.x = Math.sin(time * 5 + Math.PI) * 0.1
          }

          // Snout moving (talking)
          if (snout) {
            snout.scale.y = 1 + Math.abs(Math.sin(time * 8)) * 0.3
            snout.rotation.z = Math.sin(time * 7) * 0.05
          }

          // Eyes wide
          if (leftEye) leftEye.scale.set(1.1, 1.1, 1.1)
          if (rightEye) rightEye.scale.set(1.1, 1.1, 1.1)
          
          // Apply emotion-based eyebrows and eyes (overrides default speaking eyebrows/eyes)
          applyEmotionEyebrows()
          applyEmotionEyes()
          
        } else if (isListening) {
          // Listening animation - attentive
          avatarRef.current.rotation.y = Math.sin(time * 1.2) * 0.08
          avatarRef.current.rotation.x = Math.sin(time * 1.5) * 0.05
          
          // Ears perked and alert
          if (leftEar) {
            leftEar.rotation.z = 0.1 + Math.sin(time * 2.5) * 0.15
            leftEar.rotation.x = -0.1
          }
          if (rightEar) {
            rightEar.rotation.z = -0.1 + Math.sin(time * 2.5) * 0.15
            rightEar.rotation.x = -0.1
          }

          // Eyes focused
          if (leftEye) leftEye.scale.set(1.05, 1.05, 1.05)
          if (rightEye) rightEye.scale.set(1.05, 1.05, 1.05)

          // Apply emotion-based eyebrows and eyes
          applyEmotionEyebrows()
          applyEmotionEyes()

          // Occasional blink
          if (Math.floor(time * 2) % 5 === 0) {
            const blinkPhase = (time * 2) % 1
            if (blinkPhase < 0.2) {
              const blink = 1 - Math.sin(blinkPhase * Math.PI * 5) * 0.8
              if (leftEye && leftEye.children[0]) (leftEye.children[0] as THREE.Mesh).scale.y = blink
              if (rightEye && rightEye.children[0]) (rightEye.children[0] as THREE.Mesh).scale.y = blink
            }
          }
          
        } else if (isThinking) {
          // Thinking animation - contemplative
          avatarRef.current.rotation.x = -0.1 + Math.sin(time * 0.8) * 0.05
          avatarRef.current.rotation.y = Math.sin(time * 0.6) * 0.12
          
          // One ear drooping, one up
          if (leftEar) {
            leftEar.rotation.z = 0.2
            leftEar.rotation.x = 0.1 + Math.sin(time * 1.2) * 0.1
          }
          if (rightEar) {
            rightEar.rotation.z = -0.4
            rightEar.rotation.x = 0.3
          }

          // Eyes looking around
          if (leftEye && rightEye) {
            const eyeMove = Math.sin(time * 0.7) * 0.1
            leftEye.position.x = -0.4 + eyeMove
            rightEye.position.x = 0.4 + eyeMove
          }

          // Snout slightly to side
          if (snout) {
            snout.rotation.z = Math.sin(time * 0.5) * 0.08
          }

          // Apply emotion-based eyebrows and eyes
          applyEmotionEyebrows()
          applyEmotionEyes()
          
        } else {
          // Idle animations
          avatarRef.current.rotation.y = Math.sin(time * 0.5) * 0.05
          avatarRef.current.rotation.z = Math.sin(time * 0.4) * 0.03

          // Ears gently moving
          if (leftEar) {
            leftEar.rotation.z = Math.sin(time * 1.5) * 0.1
            leftEar.rotation.x = Math.sin(time * 1.3) * 0.05
          }
          if (rightEar) {
            rightEar.rotation.z = Math.sin(time * 1.7) * 0.1
            rightEar.rotation.x = Math.sin(time * 1.4) * 0.05
          }

          // Occasional blink
          if (Math.floor(time * 1.5) % 4 === 0) {
            const blinkPhase = (time * 1.5) % 1
            if (blinkPhase < 0.15) {
              const blink = 1 - Math.sin(blinkPhase * Math.PI * 6.67) * 0.9
              if (leftEye && leftEye.children[0]) (leftEye.children[0] as THREE.Mesh).scale.y = blink
              if (rightEye && rightEye.children[0]) (rightEye.children[0] as THREE.Mesh).scale.y = blink
            }
          }

          // Apply emotion-based eyebrows and eyes
          applyEmotionEyebrows()
          applyEmotionEyes()
        }
      }

      if (rendererRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, camera)
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(animate)

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current) return
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      if (rendererRef.current) {
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
      }
    }
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      animationRunning = false
      window.removeEventListener("resize", handleResize)
      
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose()
        rendererRef.current = null
      }
      
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />

      {/* Status badges */}
      <div className="absolute top-6 left-6 flex flex-col gap-2">
        {isThinking && (
          <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30 backdrop-blur-sm">
            <Brain className="w-3 h-3 mr-1.5 animate-pulse" />
            思考中...
          </Badge>
        )}
        {isSpeaking && (
          <Badge
            variant="secondary"
            className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 backdrop-blur-sm"
          >
            <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
            話しています
          </Badge>
        )}
        {isListening && (
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 backdrop-blur-sm">
            <Mic className="w-3 h-3 mr-1.5 animate-pulse" />
            聞いています
          </Badge>
        )}
      </div>
    </div>
  )
}

function createCuteLlamaFace(): THREE.Group {
  const face = new THREE.Group()

  // Materials
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xefefef,
    roughness: 0.7,
    metalness: 0.1,
  })

  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.4,
    metalness: 0.1,
  })

  const innerEarMaterial = new THREE.MeshStandardMaterial({
    color: 0xffe4e1,
    roughness: 0.8,
    metalness: 0.05,
  })

  const noseMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.6,
    metalness: 0.1,
  })
  
  const snoutMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.8,
    metalness: 0.05,
  })

  // Main head - cylinder-like shape (elongated vertically)
  const headGeometry = new THREE.CapsuleGeometry(0.9, 2.0, 16, 32)
  const head = new THREE.Mesh(headGeometry, bodyMaterial)
  head.position.y = -0.4
  head.scale.set(1, 1, 0.85) // Slightly flattened front-to-back
  head.name = "head"
  head.castShadow = true
  face.add(head)

  // Top of head - rounded cap
  const topGeometry = new THREE.SphereGeometry(0.9, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2)
  const top = new THREE.Mesh(topGeometry, bodyMaterial)
  top.position.y = 0.6
  top.scale.set(1, 0.6, 0.85)
  top.castShadow = true
  face.add(top)

  // Fluffy sides (cheeks outline) - adjusted positions for taller head
  const fluffPositions = [
    { x: -0.85, y: 0.1, scale: 0.35 },
    { x: -0.75, y: -0.3, scale: 0.33 },
    { x: -0.65, y: -0.65, scale: 0.3 },
    { x: 0.85, y: 0.1, scale: 0.35 },
    { x: 0.75, y: -0.3, scale: 0.33 },
    { x: 0.65, y: -0.65, scale: 0.3 },
  ]

  fluffPositions.forEach(pos => {
    const fluffGeometry = new THREE.SphereGeometry(1, 16, 16)
    const fluff = new THREE.Mesh(fluffGeometry, bodyMaterial)
    fluff.position.set(pos.x, pos.y, 0.2)
    fluff.scale.setScalar(pos.scale)
    fluff.castShadow = true
    face.add(fluff)
  })

  // Ears - positioned higher on the head
  const createEar = (): THREE.Group => {
    const earGroup = new THREE.Group()
    
    // Outer ear - elongated rounded shape
    const outerEarGeometry = new THREE.SphereGeometry(0.45, 24, 24)
    const outerEar = new THREE.Mesh(outerEarGeometry, bodyMaterial)
    outerEar.scale.set(0.7, 1.3, 0.4)
    outerEar.castShadow = true
    earGroup.add(outerEar)

    // Inner ear
    const innerEarGeometry = new THREE.SphereGeometry(0.3, 16, 16)
    const innerEar = new THREE.Mesh(innerEarGeometry, innerEarMaterial)
    innerEar.scale.set(0.6, 1.1, 0.3)
    innerEar.position.z = 0.15
    earGroup.add(innerEar)

    return earGroup
  }

  const leftEar = createEar()
  leftEar.position.set(-0.65, 1.15, 0) // Moved up
  leftEar.rotation.z = 0.35
  leftEar.name = "leftEar"
  face.add(leftEar)

  const rightEar = createEar()
  rightEar.position.set(0.65, 1.15, 0) // Moved up
  rightEar.rotation.z = -0.35
  rightEar.name = "rightEar"
  face.add(rightEar)

  // Eyes - large and round, positioned higher
  const eyeGeometry = new THREE.CircleGeometry(0.08, 32)
  const highlightGeometry = new THREE.CircleGeometry(0.02, 16)
  const highlightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  })

  // Left eye group
  const leftEyeGroup = new THREE.Group()
  leftEyeGroup.position.set(-0.4, 0.6, 0.75)
  leftEyeGroup.name = "leftEye"
  
  const leftEye = new THREE.Mesh(eyeGeometry, darkMaterial)
  leftEyeGroup.add(leftEye)
  
  const leftHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial)
  leftHighlight.position.set(0.05, 0.03, 0.01) // Relative to eye position
  leftEyeGroup.add(leftHighlight)
  
  face.add(leftEyeGroup)

  // Right eye group
  const rightEyeGroup = new THREE.Group()
  rightEyeGroup.position.set(0.4, 0.6, 0.75)
  rightEyeGroup.name = "rightEye"
  
  const rightEye = new THREE.Mesh(eyeGeometry, darkMaterial)
  rightEyeGroup.add(rightEye)
  
  const rightHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial)
  rightHighlight.position.set(0.05, 0.03, 0.01) // Relative to eye position
  rightEyeGroup.add(rightHighlight)
  
  face.add(rightEyeGroup)

  // Eyebrows - positioned above the eyes
  const eyebrowMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.4,
    metalness: 0.1,
  })

  // Left eyebrow
  const leftEyebrowGeometry = new THREE.BoxGeometry(0.25, 0.02, 0.01)
  const leftEyebrow = new THREE.Mesh(leftEyebrowGeometry, eyebrowMaterial)
  leftEyebrow.position.set(-0.4, 0.75, 0.76)
  leftEyebrow.rotation.z = -0.1 // Slight angle
  leftEyebrow.castShadow = true
  leftEyebrow.name = "leftEyebrow"
  face.add(leftEyebrow)

  // Right eyebrow
  const rightEyebrowGeometry = new THREE.BoxGeometry(0.25, 0.02, 0.01)
  const rightEyebrow = new THREE.Mesh(rightEyebrowGeometry, eyebrowMaterial)
  rightEyebrow.position.set(0.4, 0.75, 0.76)
  rightEyebrow.rotation.z = 0.1 // Slight angle (mirrored)
  rightEyebrow.castShadow = true
  rightEyebrow.name = "rightEyebrow"
  face.add(rightEyebrow)

  // Snout group - positioned lower on the elongated face
  const snoutGroup = new THREE.Group()
  snoutGroup.position.set(0, 0.25, 0.65) // Adjusted position
  snoutGroup.name = "snout"

  // Snout oval
  const snoutGeometry = new THREE.SphereGeometry(0.35, 24, 24)
  const snout = new THREE.Mesh(snoutGeometry, snoutMaterial)
  snout.scale.set(1.1, 0.8, 0.7)
  snout.castShadow = true
  snoutGroup.add(snout)

  // Nose
  const noseGeometry = new THREE.SphereGeometry(0.08, 16, 16)
  const nose = new THREE.Mesh(noseGeometry, noseMaterial)
  nose.position.set(0, 0.1, 0.35)
  nose.scale.set(0.9, 0.7, 0.8)
  snoutGroup.add(nose)

  // Vertical line from nose
  const noseLine = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8),
    darkMaterial
  )
  noseLine.position.set(0, -0.025, 0.35)
  snoutGroup.add(noseLine)

  face.add(snoutGroup)

  return face
}