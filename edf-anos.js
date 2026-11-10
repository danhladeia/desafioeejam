import {GRADE_6} from './edf-ano6.js';
import {GRADE_7} from './edf-ano7.js';
import {GRADE_8} from './edf-ano8.js';
import {GRADE_9} from './edf-ano9.js';

export const EDF_GRADES=[GRADE_6,GRADE_7,GRADE_8,GRADE_9];
export const DEFAULT_GRADE=7;
export const isGrade=value=>EDF_GRADES.some(info=>info.grade===Number(value));
export const normalizeGrade=value=>isGrade(value)?Number(value):DEFAULT_GRADE;
export const getGrade=value=>EDF_GRADES.find(info=>info.grade===normalizeGrade(value));
