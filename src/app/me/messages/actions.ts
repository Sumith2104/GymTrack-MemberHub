
"use server";

import { createMessage } from "@/lib/data";
import type { Message } from "@/lib/types";

interface SendMessageInput {
    content: string;
    gymId: string;
    senderId: string; // member_id
    receiverId: string; // formatted_gym_id
    formattedGymId: string;
}

interface ActionResult {
    success: boolean;
    data?: Message;
    error?: string;
}

export async function sendMessage(input: SendMessageInput): Promise<ActionResult> {
    if (!input.content?.trim()) {
        return { success: false, error: "Message content cannot be empty." };
    }
    if (!input.senderId || !input.receiverId || !input.gymId || !input.formattedGymId) {
        return { success: false, error: "Missing required ID to send message." };
    }

    try {
        const result = await createMessage({
          senderId: input.senderId,
          receiverId: input.receiverId,
          senderType: 'member',
          receiverType: 'admin',
          content: input.content,
          gymId: input.gymId,
          formattedGymId: input.formattedGymId,
        });

        if (result.success) {
            return { success: true, data: result.data };
        } else {
            return { success: false, error: result.error || "Failed to save message to the database." };
        }
    } catch (error) {
        console.error("[sendMessage Action] Error:", error);
        return { success: false, error: "An unexpected server error occurred." };
    }
}
