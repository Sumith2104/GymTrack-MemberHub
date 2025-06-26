
"use client";

import type { Member } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateProfilePicture, type UpdateProfilePictureState } from '@/app/me/settings/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

interface UpdateProfilePictureFormProps {
  member: Member;
}

const initialFormState: UpdateProfilePictureState = { success: false, message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        'Save Picture'
      )}
    </Button>
  );
}

const getInitials = (name: string): string => {
    if (!name) return '??';
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
        return nameParts[0].substring(0, 2).toUpperCase();
    }
    return (nameParts[0][0] + (nameParts[nameParts.length - 1][0] || '')).toUpperCase();
};

export function UpdateProfilePictureForm({ member }: UpdateProfilePictureFormProps) {
    const { toast } = useToast();
    const [state, formAction] = useActionState(updateProfilePicture, initialFormState);
    const [preview, setPreview] = useState<string | null>(member.profile_url);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.success ? "Success" : "Error",
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });
            if (state.success && state.profileUrl) {
                setPreview(state.profileUrl);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        }
    }, [state, toast]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(member.profile_url);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Update your profile picture here. Recommended size: 200x200px.</CardDescription>
            </CardHeader>
            <form action={formAction}>
                <CardContent className="space-y-4">
                    <input type="hidden" name="memberUUID" value={member.id} />
                    <div className="flex flex-col items-center gap-4">
                        <Avatar className="h-32 w-32 ring-4 ring-primary/20">
                            <AvatarImage src={preview || undefined} alt={member.name} />
                            <AvatarFallback className="text-4xl">
                                {getInitials(member.name)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="profilePicture">Change Picture</Label>
                            <Input 
                                id="profilePicture" 
                                name="profilePicture" 
                                type="file" 
                                accept="image/png, image/jpeg, image/webp" 
                                onChange={handleFileChange}
                                ref={fileInputRef}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitButton />
                </CardFooter>
            </form>
        </Card>
    );
}
