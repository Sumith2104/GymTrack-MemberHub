
"use client";

import type { Member } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Image from 'next/image';
import { updateProfilePicture, type UpdateProfilePictureState } from '@/app/me/settings/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, UploadCloud, UserCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface UpdateProfilePictureFormProps {
  member: Member;
}

const initialState: UpdateProfilePictureState = { success: false, message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Uploading...
        </>
      ) : (
        <>
         <UploadCloud className="mr-2 h-4 w-4" />
         Upload Picture
        </>
      )}
    </Button>
  );
}

export function UpdateProfilePictureForm({ member }: UpdateProfilePictureFormProps) {
  const { toast } = useToast();
  const [state, formAction] = useFormState(updateProfilePicture, initialState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(member.profile_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Success" : "Error",
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
    if (state.success && state.profileUrl) {
      setPreviewUrl(state.profileUrl);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [state, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
        setPreviewUrl(member.profile_url || null);
    }
  };

  const getInitials = (name: string): string => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>Upload a new photo to personalize your profile.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col sm:flex-row items-center gap-6">
          <input type="hidden" name="memberUUID" value={member.id} />
          
          <div className="flex-shrink-0">
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarImage asChild src={previewUrl || undefined} alt="Profile picture preview">
                {previewUrl && <Image src={previewUrl} alt="Profile picture preview" width={96} height={96} />}
              </AvatarImage>
              <AvatarFallback className="text-3xl bg-muted">
                <UserCircle className="h-12 w-12 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="w-full space-y-2">
            <Label htmlFor="profilePicture">Choose a new picture</Label>
            <Input
              id="profilePicture"
              name="profilePicture"
              type="file"
              accept="image/png, image/jpeg, image/gif"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
             <p className="text-xs text-muted-foreground">PNG, JPG, or GIF. Max 5MB.</p>
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
