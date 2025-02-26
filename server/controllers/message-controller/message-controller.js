const { Schema, default: mongoose, Mongoose } = require("mongoose");
const Message = require("../../models/Message");

const getMessage = async (req, res) => {
    try {
        const { senderId : id } = req.params;
        console.log("getmessage",id);
        
        // const message = await Message.find({
        //     senderId: id,
        //     receiverId: req.user._id
        // }).sort({date: 1});
        const message = await Message.find({
            $or: [
                { senderId: id, receiverId: req.user._id },
                { senderId: req.user._id, receiverId: id }
            ]
        }).sort({date: 1});

        const updateMessage = await Message.updateMany({
            senderId: id,
            receiverId: req.user._id,
            isRead: false
        }, {
            $set: { isRead: true }
        });

        if(!message){
            return res.status(404).json({
                success: false,
                data: {},
                message: "Message not found!"
            })
        }

        res.status(200).json({
            success: true,
            data: message
        })
    }catch(e){
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Some error occured!"
        })
    }
};

const sendMessage = async ({receiverId , senderId , message}) => {
    try {
        const newMessage = new Message({
            senderId,
            receiverId,
            message,
            date: new Date(),
            isRead: false
        });

        await newMessage.save();
        return true;

    }catch(e){
        console.log(e);
        return false;
    }
}   

const getContactList = async (req, res) => {
    try {
        //console.log(req?.user);
        
        //console.log("getcontactlist",req.user?._id);
        
        // const messages = await Message.find({ senderId: req.user._id });
        // const messages = await Message.aggregate([
        //     {
        //       '$match': {
        //         'receiverId': new mongoose.Types.ObjectId(req.user._id)
        //       }
        //     }
        //     // {
        //     //   '$lookup': {
        //     //     'from': 'users', 
        //     //     'localField': 'senderId', 
        //     //     'foreignField': '_id', 
        //     //     'as': 'result'
        //     //   }
        //     // }, {
        //     //   '$group': {
        //     //     '_id': '$result', 
        //     //     'message': {
        //     //       '$last': '$message'
        //     //     }
        //     //   }
        //     // }, {
        //     //   '$addFields': {
        //     //     'sender': {
        //     //       '$first': '$_id'
        //     //     }
        //     //   }
        //     // }, {
        //     //   '$project': {
        //     //     '_id': 0
        //     //   }
        //     // }
        //   ])
        const contactList = await Message.aggregate([
            {
              $sort: { date: -1 } // Sort by date in descending order to get the latest message first
            },
            {
              $group: {
                _id: "$senderId", // Group by senderId
                lastMessage: { $first: "$message" }, // Get the last message
                unreadCount: {
                  $sum: {
                    $cond: [{ $eq: ["$isRead", false] }, 1, 0] // Count unread messages
                  }
                },
                lastMessageDate: { $first: "$date" } // Store the date of the last message
              }
            },
            {
              $lookup: {
                from: "users", // The collection to join with
                localField: "_id", // Field from the messages collection (senderId)
                foreignField: "_id", // Field from the users collection
                as: "sender" // Output array field containing the joined sender documents
              }
            },
            {
              $unwind: "$sender" // Unwind the sender array (since $lookup returns an array)
            },
            {
              $project: {
                _id: 0, // Exclude the default _id field
                sender: {
                  _id: "$sender._id",
                  name: "$sender.userName", // Include any fields you need from the users collection
                },
                lastMessage: 1,
                lastMessageDate: 1,
                unreadCount: 1
              }
            },
            {
              $sort: { lastMessageDate: -1 } // Sort the final output by the last message date
            }
          ]);
        
        
        res.status(200).json({
            success: true,
            data: contactList
        })
    }catch(e){
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Some error occured!"
        })
    }
};

module.exports = {
    getMessage,
    sendMessage,
    getContactList
};