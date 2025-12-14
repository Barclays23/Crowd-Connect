import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import toast from "react-hot-toast"
import { userFormSchema } from "@shared/schemas/user.schema"
import { userServices } from "@/services/userServices"






export function UserManageForm() {
  
   const form = useForm<z.infer<typeof userFormSchema>>({
      resolver: zodResolver(userFormSchema),
      defaultValues: {
         name: "Rajesh Kumar",
         email: "rajesh.kumar@example.com",
         mobile: "+91-xxxxxxxxxx",
         role: "user",
         status: "active",
         profilePic: "",
      }
   })

   const onSubmit = (values: z.infer<typeof userFormSchema>) => {
      console.log('user values to be submitted:', values)

      // for creating new user
      // const response = userServices.createUserService(values);
      // for updating existing user
      // const response = userServices.updateUserService(values);
      toast.success("User updated successfully!")
   }

   return (
      <Card className="card-shadow animate-hover-lift">
         <CardHeader className="border-b border-border relative">
            <CardTitle className="text-xl font-semibold">Edit User</CardTitle>
            <Button 
               variant="ghost" 
               size="icon"
               className="absolute right-4 top-4 h-8 w-8 rounded-full hover:bg-muted"
               onClick={() => {
                  toast("Edit modal closed.");
               }}
            >
               <X className="h-4 w-4" />
            </Button>
         </CardHeader>

         <CardContent className="p-6">
            <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                           <FormItem>
                           <FormLabel>Name</FormLabel>
                           <FormControl>
                              <Input placeholder="Enter name" className="rounded-xl" {...field} />
                           </FormControl>
                           <FormMessage />
                           </FormItem>
                        )}
                     />

                     <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                           <FormItem>
                           <FormLabel>Email</FormLabel>
                           <FormControl>
                              <Input type="email" placeholder="Enter email" className="rounded-xl" {...field} />
                           </FormControl>
                           <FormMessage />
                           </FormItem>
                        )}
                     />

                     <FormField
                        control={form.control}
                        name="mobile"
                        render={({ field }) => (
                           <FormItem>
                           <FormLabel>Phone</FormLabel>
                           <FormControl>
                              <Input placeholder="+91-XXXXXXXXXX" className="rounded-xl" {...field} />
                           </FormControl>
                           <FormMessage />
                           </FormItem>
                        )}
                     />

                     <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                           <FormItem>
                           <FormLabel>Role</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                 <SelectTrigger className="rounded-xl">
                                 <SelectValue placeholder="Select role" />
                                 </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 <SelectItem value="User">User</SelectItem>
                                 <SelectItem value="Host">Host</SelectItem>
                                 <SelectItem value="Admin">Admin</SelectItem>
                              </SelectContent>
                           </Select>
                           <FormMessage />
                           </FormItem>
                        )}
                     />

                     <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                           <FormItem>
                           <FormLabel>Status</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                 <SelectTrigger className="rounded-xl">
                                 <SelectValue placeholder="Select status" />
                                 </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 <SelectItem value="Active">Active</SelectItem>
                                 <SelectItem value="Suspended">Suspended</SelectItem>
                                 <SelectItem value="Pending">Pending</SelectItem>
                              </SelectContent>
                           </Select>
                           <FormMessage />
                           </FormItem>
                        )}
                     />
                  </div>

                  <Button type="submit" className="rounded-xl">
                     Update User
                  </Button>
               </form>
            </Form>
         </CardContent>
      </Card>
   )
}
