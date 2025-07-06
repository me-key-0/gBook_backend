"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseSeeder = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("@/utils/logger");
const User_1 = require("@/models/User");
const Campus_1 = require("@/models/Campus");
const Department_1 = require("@/models/Department");
const College_1 = require("@/models/College");
const Question_1 = require("@/models/Question");
const Tag_1 = require("@/models/Tag");
const Post_1 = require("@/models/Post");
dotenv_1.default.config();
const seedData = {
    campuses: [
        {
            name: "Main Campus",
            campusId: "MAIN001",
            location: "City Center",
            description: "The main campus of the university",
        },
        {
            name: "North Campus",
            campusId: "NORTH001",
            location: "North District",
            description: "Northern branch campus",
        },
        {
            name: "South Campus",
            campusId: "SOUTH001",
            location: "South District",
            description: "Southern branch campus",
        },
    ],
    colleges: [
        {
            name: "College of Engineering",
            collegeId: "ENG001",
            description: "Engineering and Technology programs",
        },
        {
            name: "College of Business",
            collegeId: "BUS001",
            description: "Business and Management programs",
        },
        {
            name: "College of Arts and Sciences",
            collegeId: "ART001",
            description: "Liberal Arts and Sciences programs",
        },
        {
            name: "College of Medicine",
            collegeId: "MED001",
            description: "Medical and Health Sciences programs",
        },
    ],
    departments: [
        {
            name: "Computer Science",
            departmentId: "CS001",
            description: "Computer Science and Software Engineering",
        },
        {
            name: "Electrical Engineering",
            departmentId: "EE001",
            description: "Electrical and Electronics Engineering",
        },
        {
            name: "Mechanical Engineering",
            departmentId: "ME001",
            description: "Mechanical and Manufacturing Engineering",
        },
        {
            name: "Business Administration",
            departmentId: "BA001",
            description: "General Business Administration",
        },
        {
            name: "Marketing",
            departmentId: "MKT001",
            description: "Marketing and Sales",
        },
        {
            name: "Finance",
            departmentId: "FIN001",
            description: "Finance and Accounting",
        },
        {
            name: "English Literature",
            departmentId: "ENG001",
            description: "English Language and Literature",
        },
        {
            name: "Psychology",
            departmentId: "PSY001",
            description: "Psychology and Behavioral Sciences",
        },
        {
            name: "General Medicine",
            departmentId: "GMED001",
            description: "General Medical Practice",
        },
        {
            name: "Nursing",
            departmentId: "NURS001",
            description: "Nursing and Patient Care",
        },
    ],
    questions: [
        {
            question: "What is your biggest achievement during university?",
            type: "profile",
            category: "achievements",
            isRequired: true,
            order: 1,
        },
        {
            question: "What advice would you give to incoming students?",
            type: "profile",
            category: "advice",
            isRequired: true,
            order: 2,
        },
        {
            question: "What was your favorite subject?",
            type: "profile",
            category: "academics",
            isRequired: false,
            order: 3,
        },
        {
            question: "Who was your most influential professor?",
            type: "profile",
            category: "academics",
            isRequired: false,
            order: 4,
        },
        {
            question: "What extracurricular activities were you involved in?",
            type: "profile",
            category: "activities",
            isRequired: false,
            order: 5,
        },
        {
            question: "What is your final message to your classmates?",
            type: "lastword",
            category: "farewell",
            isRequired: true,
            order: 1,
        },
        {
            question: "How do you want to be remembered?",
            type: "lastword",
            category: "legacy",
            isRequired: false,
            order: 2,
        },
        {
            question: "What are your plans after graduation?",
            type: "lastword",
            category: "future",
            isRequired: false,
            order: 3,
        },
        {
            question: "What was the most challenging moment in your university journey?",
            type: "post",
            category: "challenges",
            isRequired: false,
            order: 1,
        },
        {
            question: "Share a funny memory from university",
            type: "post",
            category: "memories",
            isRequired: false,
            order: 2,
        },
        {
            question: "What skill did you develop that surprised you?",
            type: "post",
            category: "skills",
            isRequired: false,
            order: 3,
        },
        {
            question: "If you could relive one university moment, what would it be?",
            type: "post",
            category: "memories",
            isRequired: false,
            order: 4,
        },
        {
            question: "What would you change about your university experience?",
            type: "post",
            category: "reflection",
            isRequired: false,
            order: 5,
        },
    ],
    tags: [
        { name: "leader", description: "Natural leader", category: "personality" },
        {
            name: "creative",
            description: "Creative thinker",
            category: "personality",
        },
        {
            name: "analytical",
            description: "Analytical mind",
            category: "personality",
        },
        {
            name: "outgoing",
            description: "Social butterfly",
            category: "personality",
        },
        { name: "quiet", description: "Quiet observer", category: "personality" },
        { name: "funny", description: "Class clown", category: "personality" },
        { name: "serious", description: "Always focused", category: "personality" },
        {
            name: "helpful",
            description: "Always helping others",
            category: "personality",
        },
        { name: "bookworm", description: "Always studying", category: "academic" },
        {
            name: "procrastinator",
            description: "Last minute hero",
            category: "academic",
        },
        {
            name: "overachiever",
            description: "Goes above and beyond",
            category: "academic",
        },
        { name: "researcher", description: "Loves research", category: "academic" },
        {
            name: "presenter",
            description: "Great at presentations",
            category: "academic",
        },
        {
            name: "party-animal",
            description: "Life of the party",
            category: "social",
        },
        { name: "networker", description: "Knows everyone", category: "social" },
        { name: "mentor", description: "Guides others", category: "social" },
        {
            name: "team-player",
            description: "Great team member",
            category: "social",
        },
        { name: "organizer", description: "Event organizer", category: "social" },
        { name: "athlete", description: "Sports enthusiast", category: "hobbies" },
        { name: "artist", description: "Creative artist", category: "hobbies" },
        { name: "musician", description: "Music lover", category: "hobbies" },
        { name: "gamer", description: "Gaming enthusiast", category: "hobbies" },
        { name: "traveler", description: "Loves to travel", category: "hobbies" },
        { name: "foodie", description: "Food enthusiast", category: "hobbies" },
        {
            name: "photographer",
            description: "Captures moments",
            category: "hobbies",
        },
        { name: "early-bird", description: "Always early", category: "behavior" },
        { name: "night-owl", description: "Night person", category: "behavior" },
        {
            name: "coffee-addict",
            description: "Runs on coffee",
            category: "behavior",
        },
        {
            name: "multitasker",
            description: "Juggles everything",
            category: "behavior",
        },
        {
            name: "perfectionist",
            description: "Attention to detail",
            category: "behavior",
        },
    ],
    users: [],
    posts: [],
};
class DatabaseSeeder {
    constructor() {
        this.campusIds = [];
        this.collegeIds = [];
        this.departmentIds = [];
        this.questionIds = [];
        this.userIds = [];
    }
    async connect() {
        try {
            await mongoose_1.default.connect(process.env.MONGODB_URI);
            logger_1.logger.info("Connected to MongoDB for seeding");
        }
        catch (error) {
            logger_1.logger.error("Failed to connect to MongoDB:", error);
            throw error;
        }
    }
    async disconnect() {
        await mongoose_1.default.disconnect();
        logger_1.logger.info("Disconnected from MongoDB");
    }
    async clearDatabase() {
        logger_1.logger.info("Clearing existing data...");
        await Promise.all([
            User_1.User.deleteMany({}),
            Campus_1.Campus.deleteMany({}),
            College_1.College.deleteMany({}),
            Department_1.Department.deleteMany({}),
            Question_1.Question.deleteMany({}),
            Tag_1.Tag.deleteMany({}),
            Post_1.Post.deleteMany({}),
        ]);
        logger_1.logger.info("Database cleared");
    }
    async seedCampuses() {
        logger_1.logger.info("Seeding campuses...");
        const campuses = await Campus_1.Campus.insertMany(seedData.campuses);
        this.campusIds = campuses.map((campus) => campus._id.toString());
        logger_1.logger.info(`Seeded ${campuses.length} campuses`);
    }
    async seedColleges() {
        logger_1.logger.info("Seeding colleges...");
        const collegesWithCampus = seedData.colleges.map((college, index) => ({
            ...college,
            campus: this.campusIds[index % this.campusIds.length],
        }));
        const colleges = await College_1.College.insertMany(collegesWithCampus);
        this.collegeIds = colleges.map((college) => college._id.toString());
        logger_1.logger.info(`Seeded ${colleges.length} colleges`);
    }
    async seedDepartments() {
        logger_1.logger.info("Seeding departments...");
        const departmentsWithCollege = seedData.departments.map((department, index) => ({
            ...department,
            college: this.collegeIds[index % this.collegeIds.length],
        }));
        const departments = await Department_1.Department.insertMany(departmentsWithCollege);
        this.departmentIds = departments.map((dept) => dept._id.toString());
        logger_1.logger.info(`Seeded ${departments.length} departments`);
    }
    async seedQuestions() {
        logger_1.logger.info("Seeding questions...");
        const questions = await Question_1.Question.insertMany(seedData.questions);
        this.questionIds = questions.map((q) => q._id.toString());
        logger_1.logger.info(`Seeded ${questions.length} questions`);
    }
    async seedTags() {
        logger_1.logger.info("Seeding tags...");
        const tags = await Tag_1.Tag.insertMany(seedData.tags);
        logger_1.logger.info(`Seeded ${tags.length} tags`);
    }
    async seedUsers() {
        logger_1.logger.info("Seeding users...");
        const hashedPassword = await bcryptjs_1.default.hash("password123", 12);
        const adminUser = await User_1.User.create({
            firstName: "Admin",
            lastName: "User",
            surname: "System",
            username: "admin",
            email: "admin@gradbook.com",
            password: hashedPassword,
            phoneNumber: "+1234567890",
            graduationYear: 2024,
            campus: this.campusIds[0],
            college: this.collegeIds[0],
            department: this.departmentIds[0],
            role: "admin",
            isVerified: true,
            isActive: true,
            profileCompleted: true,
        });
        const graduates = [];
        const firstNames = [
            "John",
            "Jane",
            "Mike",
            "Sarah",
            "David",
            "Emily",
            "Chris",
            "Lisa",
            "Tom",
            "Anna",
        ];
        const lastNames = [
            "Smith",
            "Johnson",
            "Williams",
            "Brown",
            "Jones",
            "Garcia",
            "Miller",
            "Davis",
            "Rodriguez",
            "Martinez",
        ];
        const surnames = [
            "Jr",
            "Sr",
            "III",
            "IV",
            "V",
            "VI",
            "VII",
            "VIII",
            "IX",
            "X",
        ];
        for (let i = 0; i < 50; i++) {
            const firstName = firstNames[i % firstNames.length];
            const lastName = lastNames[i % lastNames.length];
            const surname = surnames[i % surnames.length];
            graduates.push({
                firstName,
                lastName,
                surname,
                username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@university.edu`,
                password: hashedPassword,
                phoneNumber: `+123456789${i.toString().padStart(2, "0")}`,
                graduationYear: 2024,
                campus: this.campusIds[i % this.campusIds.length],
                college: this.collegeIds[i % this.collegeIds.length],
                department: this.departmentIds[i % this.departmentIds.length],
                role: "graduate",
                isVerified: true,
                isActive: true,
                profileCompleted: true,
                quote: `This is my graduation quote - ${firstName} ${lastName}`,
                socialLinks: {
                    instagram: `@${firstName.toLowerCase()}${lastName.toLowerCase()}`,
                    telegram: `@${firstName.toLowerCase()}${lastName.toLowerCase()}`,
                },
            });
        }
        const guests = [];
        const guestSurnames = [
            "Guest",
            "Visitor",
            "Friend",
            "Family",
            "Alumni",
            "Supporter",
            "Member",
            "Attendee",
            "Participant",
            "Observer",
        ];
        for (let i = 0; i < 10; i++) {
            const firstName = firstNames[i % firstNames.length];
            const lastName = lastNames[i % lastNames.length];
            const surname = guestSurnames[i % guestSurnames.length];
            guests.push({
                firstName,
                lastName,
                surname,
                username: `guest${firstName.toLowerCase()}${i}`,
                email: `guest${i}@example.com`,
                password: hashedPassword,
                graduationYear: 2024,
                campus: this.campusIds[i % this.campusIds.length],
                college: this.collegeIds[i % this.collegeIds.length],
                department: this.departmentIds[i % this.departmentIds.length],
                role: "guest",
                isVerified: true,
                isActive: true,
                profileCompleted: true,
            });
        }
        const allUsers = [
            adminUser,
            ...(await User_1.User.insertMany([...graduates, ...guests])),
        ];
        this.userIds = allUsers.map((user) => user._id.toString());
        logger_1.logger.info(`Seeded ${allUsers.length} users (1 admin, ${graduates.length} graduates, ${guests.length} guests)`);
    }
    async seedPosts() {
        logger_1.logger.info("Seeding posts...");
        const posts = [];
        const graduateUsers = this.userIds.slice(1, 51);
        const lastWordQuestions = this.questionIds.filter((_, index) => seedData.questions[index]?.type === "lastword");
        for (const userId of graduateUsers) {
            const lastWordQuestion = lastWordQuestions[0] || this.questionIds[0];
            posts.push({
                user: userId,
                question: lastWordQuestion,
                answer: `This is my final message to all my classmates. Thank you for the amazing memories and friendships that will last a lifetime!`,
                type: "lastword",
            });
        }
        const postQuestions = this.questionIds.filter((_, index) => seedData.questions[index]?.type === "post");
        for (let i = 0; i < 30; i++) {
            const userId = graduateUsers[i % graduateUsers.length];
            const questionId = postQuestions[i % postQuestions.length] ||
                this.questionIds[i % this.questionIds.length];
            const answers = [
                "University has been an incredible journey of growth and discovery!",
                "The friendships I made here will last a lifetime.",
                "Every challenge taught me something valuable about myself.",
                "I'm grateful for all the opportunities this place provided.",
                "The memories we created together are priceless.",
                "This experience shaped who I am today.",
                "Looking back, every moment was worth it.",
                "The knowledge and skills I gained here are invaluable.",
                "Thank you to all the professors who believed in us.",
                "Ready to take on the world with what I've learned!",
            ];
            posts.push({
                user: userId,
                question: questionId,
                answer: answers[i % answers.length],
                type: "question",
            });
        }
        const createdPosts = await Post_1.Post.insertMany(posts);
        logger_1.logger.info(`Seeded ${createdPosts.length} posts`);
    }
    async seed() {
        try {
            await this.connect();
            await this.clearDatabase();
            await this.seedCampuses();
            await this.seedColleges();
            await this.seedDepartments();
            await this.seedQuestions();
            await this.seedTags();
            await this.seedUsers();
            await this.seedPosts();
            logger_1.logger.info("✅ Database seeding completed successfully!");
            logger_1.logger.info("\n📋 Sample Credentials:");
            logger_1.logger.info("Admin: admin@gradbook.com / password123");
            logger_1.logger.info("Graduate: john.smith0@university.edu / password123");
            logger_1.logger.info("Guest: guest0@example.com / password123");
        }
        catch (error) {
            logger_1.logger.error("❌ Database seeding failed:", error);
            throw error;
        }
        finally {
            await this.disconnect();
        }
    }
}
exports.DatabaseSeeder = DatabaseSeeder;
if (require.main === module) {
    const seeder = new DatabaseSeeder();
    seeder.seed().catch((error) => {
        logger_1.logger.error("Seeding failed:", error);
        process.exit(1);
    });
}
//# sourceMappingURL=seed.js.map