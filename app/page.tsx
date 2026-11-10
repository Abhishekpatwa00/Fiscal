import { Button } from "@/components/ui/button"
import { V1 } from "./main/v1"
import { redirect } from "next/navigation"
import { GetUser } from "@/components/routes/auth/getUser";
import Link from "next/link";




export default function Page() {

  return (
    <>
      <div className="flex flex-col gap-12 items-center justify-center">
        <div className="flex flex-col text-5xl gap-[-12] justify-center  items-center"><span>
          Manage your <span className="font-[family-name:var(--font-peace-sans)] text-5xl">Finance</span>
        </span><br />Like Never Before<br />
        </div>
        <Link href={"/signup"}><Button>Get Started</Button></Link>
      </div>

    </>
  );
}
