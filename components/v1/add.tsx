import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"


export const AddExpense = () => {
  return (
    <>
      <Sheet>
        <SheetTrigger render={
          <Button variant={"outline"}>Add</Button>
        } />
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add a new Expense</SheetTitle>
                      <SheetDescription>
                        Fill the details of your expense. Click save when you&apos;re done.
                      </SheetDescription>
          </SheetHeader>

        </SheetContent>
      </Sheet>
    </>
  )
}
