import { useRouter } from "next/router"
import { useAuth } from "@/context/AuthContext"
import FollowersList from "@/components/FollowerList"
import { useEffect, useState } from "react"

export default function ProfileFollowersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  if (!ready) return <div className="p-8 text-white">Loading...</div>

  // Guard: redirect to login if not authenticated
  if (!user) {
    if (typeof window !== "undefined") router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-[#11161D] text-gray-100">
      <h1 className="text-2xl font-semibold p-8">Followers</h1>
      <FollowersList username={user.username} />
    </div>
  )
}
