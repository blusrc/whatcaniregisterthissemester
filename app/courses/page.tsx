import { MongoClient } from "mongodb";
import { columns, Course } from "./columns";
import { DataTable } from "./data-table";

// Course type with serialized _id and filtered priorities
type SerializedCourse = Course & {
  _id: string;
  prioritiies: Course["prioritiies"]; // Only matching priorities will be included
};

type GetDataResult =
  | { success: true; data: SerializedCourse[]; count: number }
  | { success: false; error: string };

interface StudentCriteria {
  year: number | null;
  school: string | null;
  major: string | null;
}

function buildPriorityQuery(studentCriteria: StudentCriteria) {
  const { year, school, major } = studentCriteria;
  const orConditions = [];

  // Case 1: Specific year + school + major
  if (year && school && major) {
    orConditions.push({
      prioritiies: {
        $elemMatch: {
          "group.year": year,
          "group.school": school,
          "group.major": major,
          "group.level": "ug",
        },
      },
    });
  }

  // Case 2: Year + school (major is null)
  if (year && school) {
    orConditions.push({
      prioritiies: {
        $elemMatch: {
          "group.year": year,
          "group.school": school,
          "group.major": null,
          "group.level": "ug",
        },
      },
    });
  }

  // Case 3: School + major (year is null)
  if (school && major) {
    orConditions.push({
      prioritiies: {
        $elemMatch: {
          "group.year": null,
          "group.school": school,
          "group.major": major,
          "group.level": "ug",
        },
      },
    });
  }

  // Case 4: School only (year and major are null)
  if (school) {
    orConditions.push({
      prioritiies: {
        $elemMatch: {
          "group.year": null,
          "group.school": school,
          "group.major": null,
          "group.level": "ug",
        },
      },
    });
  }

  return orConditions.length > 0 ? { $or: orConditions } : {};
}

function filterMatchingPriorities(
  course: any,
  studentCriteria: StudentCriteria
): SerializedCourse {
  const { year, school, major } = studentCriteria;

  // Define priority levels (1 = highest, 4 = lowest)
  const priorityLevels = [
    // Level 1: Exact match (year + school + major)
    (group: any) =>
      group.year === year &&
      group.school === school &&
      group.major === major &&
      group.level === "ug",
    // Level 2: Year + school match (major is null)
    (group: any) =>
      group.year === year &&
      group.school === school &&
      group.major === null &&
      group.level === "ug",
    // Level 3: School + major match (year is null)
    (group: any) =>
      group.year === null &&
      group.school === school &&
      group.major === major &&
      group.level === "ug",
    // Level 4: School only match (year and major are null)
    (group: any) =>
      group.year === null &&
      group.school === school &&
      group.major === null &&
      group.level === "ug",
  ];

  // Find the highest priority match (lowest level number)
  let highestPriorityMatch = null;

  for (let level = 0; level < priorityLevels.length; level++) {
    const matchingPriority = course.prioritiies.find((priority: any) =>
      priorityLevels[level](priority.group)
    );

    if (matchingPriority) {
      highestPriorityMatch = matchingPriority;
      break; // Stop at the first (highest) match
    }
  }

  return {
    ...course,
    _id: course._id.toString(),
    prioritiies: highestPriorityMatch ? [highestPriorityMatch] : [],
  };
}

async function getData(
  studentCriteria: StudentCriteria
): Promise<GetDataResult> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const database = client.db("courses");
    const collection = database.collection<Course>("fall2025");

    const query = buildPriorityQuery(studentCriteria);

    // Return all courses if no criteria, otherwise filter by query
    const courses =
      Object.keys(query).length > 0
        ? await collection.find(query).toArray()
        : await collection.find({}).toArray();

    // Serialize and filter priorities for each course
    const serializedCourses = courses.map((course) =>
      filterMatchingPriorities(course, studentCriteria)
    );

    return {
      success: true,
      data: serializedCourses,
      count: serializedCourses.length,
    };
  } catch (error) {
    console.error("Database connection error:", error);
    return {
      success: false,
      error: "Failed to fetch courses from database",
    };
  } finally {
    await client.close();
  }
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; school?: string; major?: string }>;
}) {
  const params = await searchParams;

  const studentCriteria: StudentCriteria = {
    year: params.year ? parseInt(params.year) : null,
    school: params.school || null,
    major: params.major || null,
  };

  const res = await getData(studentCriteria);

  if (!res.success) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <p className="text-red-600 mb-4">{res.error}</p>
          <p className="text-sm text-gray-600">
            Please try again or contact support if the issue persists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Available Courses</h1>
        {studentCriteria.year && studentCriteria.school && (
          <p className="text-gray-600 mt-2">
            Courses for Year {studentCriteria.year} {studentCriteria.school}
            {studentCriteria.major && ` ${studentCriteria.major}`} students
          </p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Found {res.count} courses with matching priorities
        </p>
      </div>
      <DataTable columns={columns} data={res.data} />
    </div>
  );
}
