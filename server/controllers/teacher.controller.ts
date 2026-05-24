import type { Request, Response } from 'express';
import Course from '../models/course.model.js';
import Student from '../models/student.model.js';
import { USER_MESSAGES } from '../utils/user-messages.js';

/**
 * Get all unique classes for the authenticated teacher
 * Classes are derived from courses and students registered by the teacher
 */
export const getTeacherClasses = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;

    if (!teacherId) {
      return res.status(401).json({
        message: USER_MESSAGES.AUTH.UNAUTHORIZED,
      });
    }

    // Get unique class names from courses taught by this teacher
    const courseClasses = await Course.find(
      { teacher: teacherId, isDeleted: false },
      { className: 1 }
    ).distinct('className');

    // Get unique class names from students registered by this teacher
    const studentClasses = await Student.find(
      { registeredBy: teacherId, isDeleted: false },
      { className: 1 }
    ).distinct('className');

    // Merge and sort unique classes
    const allClasses = Array.from(
      new Set([...courseClasses, ...studentClasses])
    ).sort();

    if (allClasses.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No classes available yet.',
      });
    }

    return res.status(200).json({
      success: true,
      data: allClasses,
    });
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    return res.status(500).json({
      message: USER_MESSAGES.GENERAL.SERVER_ERROR,
    });
  }
};

/**
 * Get all unique years for the authenticated teacher
 * Used for academic year filtering
 */
export const getTeacherYears = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;

    if (!teacherId) {
      return res.status(401).json({
        message: USER_MESSAGES.AUTH.UNAUTHORIZED,
      });
    }

    // Get unique years from courses taught by this teacher
    const courseYears = await Course.find(
      { teacher: teacherId, isDeleted: false },
      { year: 1 }
    ).distinct('year');

    // Get unique years from students registered by this teacher
    const studentYears = await Student.find(
      { registeredBy: teacherId, isDeleted: false },
      { year: 1 }
    ).distinct('year');

    // Merge and sort unique years
    const allYears = Array.from(
      new Set([...courseYears, ...studentYears])
    ).sort((a, b) => b.localeCompare(a)); // Sort descending (latest first)

    if (allYears.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: allYears,
    });
  } catch (error) {
    console.error('Error fetching teacher years:', error);
    return res.status(500).json({
      message: USER_MESSAGES.GENERAL.SERVER_ERROR,
    });
  }
};
