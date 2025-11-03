
"use client";

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { logWorkoutAction, type LogWorkoutState } from '@/app/me/workout-tracking/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2, CalendarIcon, Loader2 } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { format } from 'date-fns';

interface LogWorkoutFormProps {
  memberId: string;
}

const exerciseSchema = z.object({
  name: z.string().min(1, 'Required'),
  sets: z.coerce.number().int().positive(),
  reps: z.coerce.number().int().positive(),
  weight: z.coerce.number().min(0),
});

const formSchema = z.object({
  date: z.date({ required_error: "A date is required." }),
  notes: z.string().optional(),
  exercises: z.array(exerciseSchema).min(1, 'Add at least one exercise.'),
});

type FormValues = z.infer<typeof formSchema>;

const initialState: LogWorkoutState = { success: false, message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving Workout...
        </>
      ) : (
        'Save Workout'
      )}
    </Button>
  );
}

export function LogWorkoutForm({ memberId }: LogWorkoutFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [actionState, formAction] = useActionState(logWorkoutAction, initialState);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      notes: '',
      exercises: [{ name: '', sets: 3, reps: 10, weight: 0 }],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "exercises",
  });
  
  const watchedDate = watch('date');

  useEffect(() => {
    if (actionState.message) {
      toast({
        title: actionState.success ? "Success" : "Error",
        description: actionState.message,
        variant: actionState.success ? 'default' : 'destructive',
      });
      if (actionState.success) {
        setOpen(false);
        reset();
      }
    }
  }, [actionState, toast, reset]);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Log New Workout
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Log a New Workout</DialogTitle>
          <DialogDescription>
            Add your exercises and track your progress for today's session.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="memberId" value={memberId} />
            <input type="hidden" name="date" value={format(watchedDate, 'yyyy-MM-dd')} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Workout Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !watchedDate && "text-muted-foreground"
                        )}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watchedDate ? formatDate(watchedDate.toISOString(), {year: 'numeric', month: 'long', day: 'numeric'}) : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="single"
                        selected={watchedDate}
                        onSelect={(day) => setValue('date', day || new Date(), { shouldValidate: true })}
                        initialFocus
                        />
                    </PopoverContent>
                </Popover>
                 {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Workout Notes</Label>
                  <Textarea
                  id="notes"
                  placeholder="Any notes about today's workout? e.g., 'Felt strong today', 'Lowered weight on squats'"
                  {...register('notes')}
                  name="notes"
                  />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Exercises</Label>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end p-3 bg-muted/50 rounded-lg">
                  <div className="col-span-12 sm:col-span-4 space-y-1">
                     <Label htmlFor={`exercises[${index}].name`} className="text-xs">Exercise Name</Label>
                     <Input {...register(`exercises.${index}.name`)} name={`exercises[${index}].name`} placeholder="e.g., Bench Press" />
                  </div>
                  <div className="col-span-4 sm:col-span-2 space-y-1">
                     <Label htmlFor={`exercises-sets-${index}`} className="text-xs">Sets</Label>
                     <Input type="number" {...register(`exercises.${index}.sets`)} name={`exercises-sets-${index}`} placeholder="Sets" />
                  </div>
                  <div className="col-span-4 sm:col-span-2 space-y-1">
                    <Label htmlFor={`exercises-reps-${index}`} className="text-xs">Reps</Label>
                    <Input type="number" {...register(`exercises.${index}.reps`)} name={`exercises-reps-${index}`} placeholder="Reps" />
                  </div>
                   <div className="col-span-4 sm:col-span-2 space-y-1">
                    <Label htmlFor={`exercises-weight-${index}`} className="text-xs">Weight (kg)</Label>
                    <Input type="number" step="0.5" {...register(`exercises.${index}.weight`)} name={`exercises-weight-${index}`} placeholder="Weight" />
                  </div>
                  <div className="col-span-12 sm:col-span-2 flex justify-end">
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
               {errors.exercises && !Array.isArray(errors.exercises) && <p className="text-sm text-destructive">{errors.exercises.message}</p>}

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ name: '', sets: 3, reps: 10, weight: 0 })}
                className="w-full"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Exercise
              </Button>
            </div>
            
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <SubmitButton />
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
