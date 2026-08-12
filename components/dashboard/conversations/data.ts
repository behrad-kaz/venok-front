// components/dashboard/conversations/data.ts
import { Conversation, StatusBadge } from "./types";

export const getStatusBadge = (status: Conversation["status"]): StatusBadge => {
  switch (status) {
    case "waiting":
      return {
        text: "در انتظار پاسخ",
        color: "bg-[rgba(242,184,75,0.12)] text-[#f2b84b] border-[rgba(242,184,75,0.28)]",
        dotColor: "bg-[#f2b84b]",
      };
    case "answered":
      return {
        text: "پاسخ داده شده",
        color: "bg-[rgba(91,224,168,0.12)] text-[#5be0a8] border-[rgba(91,224,168,0.28)]",
        dotColor: "bg-[#5be0a8]",
      };
    case "open":
      return {
        text: "باز",
        color: "bg-[rgba(89,216,195,0.12)] text-[#59D8C3] border-[rgba(89,216,195,0.3)]",
        dotColor: "bg-[#59D8C3]",
      };
    case "closed":
      return {
        text: "بسته شده",
        color: "bg-[rgba(111,136,128,0.12)] text-gray-400 border-[rgba(111,136,128,0.22)]",
        dotColor: "bg-gray-500",
      };
  }
};
