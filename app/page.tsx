import { Button } from "@/components/ui/button"
import { V1 } from "./main/v1"

export default function Page() {
  return (
    <>
      <div className="bg-[#f6f4f0] fixed z-[-1] ">
      </div>
      <div className="flex min-h-50 p-6">
        <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
          <div>
           <img src="/logo-transparent.png " className="w-32 ml-8 mt-[-20]" />
          </div>
        </div>

      </div>
       <V1></V1>
    </>

  )
}
