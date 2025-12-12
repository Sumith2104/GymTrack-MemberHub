
"use client";

import type { Member } from '@/lib/types';
import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { updateProfile, type UpdateProfileState } from '@/app/me/settings/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface UpdateProfileFormProps {
  member: Member;
}

const initialFormState: UpdateProfileState = { success: false, message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating...
        </>
      ) : (
        'Save Changes'
      )}
    </Button>
  );
}

export function UpdateProfileForm({ member }: UpdateProfileFormProps) {
    const { toast } = useToast();
    const [state, formAction] = useFormState(updateProfile, initialFormState);

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.success ? "Success" : "Error",
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });
        }
    }, [state, toast]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Update Profile</CardTitle>
                <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <form action={formAction}>
                <CardContent className="space-y-4">
                    <input type="hidden" name="memberId" value={member.member_id} />
                    
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={member.name}
                            required
                        />
                        {state.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="e.g., 9876543210"
                            defaultValue={member.phone_number || ''}
                        />
                        {state.errors?.phone_number && <p className="text-sm font-medium text-destructive">{state.errors.phone_number}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                            id="age"
                            name="age"
                            type="number"
                            placeholder="e.g., 25"
                            defaultValue={member.age || ''}
                        />
                        {state.errors?.age && <p className="text-sm font-medium text-destructive">{state.errors.age}</p>}
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitButton />
                </CardFooter>
            </form>
        </Card>
    );
}
