export default function AppLoading() {
  return (
    <div className="min-h-screen bg-oc-black flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-oc-gray rounded-full animate-pulse" />
        <div className="w-2 h-2 bg-oc-gray rounded-full animate-pulse [animation-delay:0.2s]" />
        <div className="w-2 h-2 bg-oc-gray rounded-full animate-pulse [animation-delay:0.4s]" />
      </div>
    </div>
  )
}
