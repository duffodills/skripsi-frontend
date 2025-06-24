import { useRouter } from "next/router"
import { useAuth } from "@/context/AuthContext"
import FollowingList from "@/components/FollowingList"
import { useEffect, useState } from "react"

export default function ProfileFollowingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  if (!ready) return <div className="p-8 text-white">Loading...</div>

  // guard: redirect to login if not authenticated
  if (!user) {
    if (typeof window !== "undefined") router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-[#11161D] text-gray-100">
      <h1 className="text-2xl font-semibold p-8">Following</h1>
      {/* Kirim user.username ke komponen FollowingList */}
      <FollowingList username={user.username} />
    </div>
  )
}
