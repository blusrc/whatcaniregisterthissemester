"use client";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { UseFormReturn } from "react-hook-form";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMediaQuery } from "@/hooks/use-media-query";

// prettier-ignore
const majors = [
    { label: "anth", name: "Anthropology", school: "SSH" },
    { label: "biosci", name: "Biological Sciences", school: "SSH" },
    { label: "chem", name: "Chemistry", school: "SSH" },
    { label: "econ", name: "Economics", school: "SSH" },
    { label: "hist", name: "History", school: "SSH" },
    { label: "math", name: "Mathematics", school: "SSH" },
    { label: "phys", name: "Physics", school: "SSH" },
    { label: "psir", name: "Political Science and International Relations", school: "SSH" },
    { label: "soci", name: "Sociology", school: "SSH" },
    { label: "wllc", name: "World Languages, Literatures and Cultures", school: "SSH" },

    { label: "busadm", name: "Business Administration", school: "GSB" },

    { label: "cme", name: "Chemical and Materials Engineering", school: "SEDS" },
    { label: "comsci", name: "Computer Science", school: "SEDS" },
    { label: "cee", name: "Civil and Environmental Engineering", school: "SEDS" },
    { label: "ece", name: "Electrical and Computer Engineering", school: "SEDS" },
    { label: "mae", name: "Mechanical and Aerospace Engineering", school: "SEDS" },
    { label: "robeng", name: "Robotics Engineering", school: "SEDS" },
    { label: "robmec", name: "Robotics Engineering", school: "SEDS" },

    { label: "geol", name: "Geology", school: "SMG" },
    { label: "mineng", name: "Mining Engineering", school: "SMG" },
    { label: "peteng", name: "Petroleum Engineering", school: "SMG" },

    { label: "6yrm", name: "Six-year Medical Program", school: "SOM" },
    { label: "medsci", name: "Medical Sciences", school: "SOM" },
    { label: "nurs", name: "Nursing", school: "SOM" },
];

const majors_grouped = [
  {
    school: "SSH",
    majors: [
      { label: "anth", name: "Anthropology", school: "SSH" },
      { label: "biosci", name: "Biological Sciences", school: "SSH" },
      { label: "chem", name: "Chemistry", school: "SSH" },
      { label: "econ", name: "Economics", school: "SSH" },
      { label: "hist", name: "History", school: "SSH" },
      { label: "math", name: "Mathematics", school: "SSH" },
      { label: "phys", name: "Physics", school: "SSH" },
      {
        label: "psir",
        name: "Political Science and International Relations",
        school: "SSH",
      },
      { label: "soci", name: "Sociology", school: "SSH" },
      {
        label: "wllc",
        name: "World Languages, Literatures and Cultures",
        school: "SSH",
      },
    ],
  },
  {
    school: "GSB",
    majors: [
      { label: "busadm", name: "Business Administration", school: "GSB" },
    ],
  },
  {
    school: "SEDS",
    majors: [
      {
        label: "cme",
        name: "Chemical and Materials Engineering",
        school: "SEDS",
      },
      { label: "comsci", name: "Computer Science", school: "SEDS" },
      {
        label: "cee",
        name: "Civil and Environmental Engineering",
        school: "SEDS",
      },
      {
        label: "ece",
        name: "Electrical and Computer Engineering",
        school: "SEDS",
      },
      {
        label: "mae",
        name: "Mechanical and Aerospace Engineering",
        school: "SEDS",
      },
      { label: "robeng", name: "Robotics Engineering", school: "SEDS" },
      { label: "robmec", name: "Robotics Engineering", school: "SEDS" },
    ],
  },
  {
    school: "SMG",
    majors: [
      { label: "geol", name: "Geology", school: "SMG" },
      { label: "mineng", name: "Mining Engineering", school: "SMG" },
      { label: "peteng", name: "Petroleum Engineering", school: "SMG" },
    ],
  },
  {
    school: "SOM",
    majors: [
      { label: "6yrm", name: "Six-year Medical Program", school: "SOM" },
      { label: "medsci", name: "Medical Sciences", school: "SOM" },
      { label: "nurs", name: "Nursing", school: "SOM" },
    ],
  },
] as const;

const formSchema = z.object({
  year: z.number().min(1).max(6),
  major: z.enum([
    "cee",
    "busadm",
    "ece",
    "hist",
    "mae",
    "psir",
    "chem",
    "econ",
    "geol",
    "robmec",
    "wllc",
    "6yrm",
    "soci",
    "nurs",
    "math",
    "anth",
    "biosci",
    "robeng",
    "mineng",
    "cme",
    "medsci",
    "comsci",
    "phys",
    "peteng",
  ]),
});

const year_names = ["Freshman", "Sophomore", "Junior", "Senior", "5th", "6th"];

export function StudentForm() {
  const id = useId();
  const router = useRouter();

  const [isLoading, setIsLoading] = React.useState(false);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Find the selected major to get school information
    const selectedMajor = majors.find((major) => major.label === values.major);

    if (!selectedMajor) {
      console.error("Major not found");
      return;
    }

    // Create URL search params
    const searchParams = new URLSearchParams({
      year: values.year.toString(),
      school: selectedMajor.school.toLowerCase(),
      major: selectedMajor.label.toLowerCase(), // Use full name instead of label
    });

    // Redirect to courses page with search params
    router.push(`/courses?${searchParams.toString()}`);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-xl w-full"
      >
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Year</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value?.toString()}
                  className="flex gap-0 -space-x-px shadow-xs rounded-md"
                >
                  {[1, 2, 3, 4, 5, 6].map((value) => (
                    <div
                      key={value}
                      className="border-input has-data-[state=checked]:border-primary/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex size-16 flex-1 cursor-pointer flex-col items-center justify-center gap-3 border text-center text-sm font-medium transition-[color,box-shadow] outline-none  has-focus-visible:ring-[3px] has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50 has-data-[state=checked]:z-10 first:rounded-s-md last:rounded-e-md "
                    >
                      <FormItem>
                        <FormControl>
                          <label className="size-16 cursor-pointer flex flex-col items-center justify-around">
                            <RadioGroupItem
                              id={`${id}-${value}`}
                              value={value.toString()}
                              onSelect={() => {
                                form.setValue("year", value);
                              }}
                              className="sr-only after:absolute after:inset-0"
                            />

                            <span className="text-lg font-medium">{value}</span>
                            <span className="text-[10px] md:text-xs text-muted-foreground ">
                              {year_names[value - 1]}
                            </span>
                          </label>
                        </FormControl>
                      </FormItem>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="major"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Major</FormLabel>
              <FormControl>
                <ComboBoxResponsive form={form} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Find My Courses
        </Button>
      </form>
    </Form>
  );
}

export function ComboBoxResponsive({
  form,
}: {
  form: ReturnType<typeof useForm<z.infer<typeof formSchema>>>;
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <FormControl>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              {form.watch("major")
                ? majors.find((m) => m.label === form.watch("major"))?.name
                : "Select your major..."}
            </Button>
          </PopoverTrigger>
        </FormControl>
        <PopoverContent
          className="w-[468px] p-0 max-h-[640px] overflow-scroll"
          align="start"
        >
          <MajorList setOpen={setOpen} form={form} />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <FormControl>
        <DrawerTrigger asChild>
          <Button variant="outline" className="w-[150px] justify-start">
            {form.watch("major")
              ? majors.find((m) => m.label === form.watch("major"))?.name
              : "Select your major..."}
          </Button>
        </DrawerTrigger>
      </FormControl>
      <DrawerContent className="px-4">
        <DrawerTitle>Majors</DrawerTitle>
        <div className="mt-4 border-t">
          <MajorList setOpen={setOpen} form={form} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function MajorList({
  setOpen,
  form,
}: {
  setOpen: (open: boolean) => void;
  form: UseFormReturn<z.infer<typeof formSchema>>;
}) {
  return (
    <Command>
      <CommandInput />
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandList className="max-h-[456px]">
        {majors_grouped.map((group) => (
          <CommandGroup heading={group.school} key={group.school}>
            {group.majors.map((major) => (
              <CommandItem
                key={`${major.school}-${major.label}`}
                value={major.label}
                onSelect={() => {
                  form.setValue("major", major.label);
                  setOpen(false);
                }}
              >
                {major.name}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  );
}
