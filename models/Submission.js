import mongoose  from "mongoose";

const submissionSchema= new mongoose.Schema(
    {
    studentId :{type:String,requird:true},
    assignmentId:{type:String,requird :true},
     text:{type:String,requird :true},
      status:{type:String,enum:["queued","running","completed","failed"] ,default:"queued"},
      score:Number,
      feedback:String,
      error:String
      
    },
    {timestamps:true}

)

export default mongoose.model("Submission ",submissionSchema);