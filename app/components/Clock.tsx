import { Clock4 } from "lucide-react";



export default function Clock({time}:any){
  return(
    <>
     <div className=" text-gray-600 flex flex-row md:gap-2 items-center ">
        <span>
          {time.day} {time.month}, {time.year}
        </span>
        <span className="flex items-center gap-2  w-[120px] text-gray-600">
        <Clock4 size={18}/> {time.hours}:{time.minutes}:{time.seconds}
        </span>
      </div>
      
    </>
  )
}