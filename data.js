// Scholarship Database
const scholarships = [
    {
        id: 1,
        name: "National Merit Scholarship",
        amount: "₹50,000",
        deadline: "2026-05-15",
        status: "Open",
        description: "Merit-based scholarship for students with excellent academic performance",
        education: ["12th", "undergraduate"],
        field: ["science", "commerce", "arts", "engineering"],
        percentage: 85,
        income: "0-600000",
        category: ["general", "obc", "sc", "st"],
        link: "https://scholarships.gov.in",
        documents: [
            "10th and 12th Mark Sheets",
            "Income Certificate",
            "Aadhar Card",
            "Bank Account Details",
            "Passport Size Photograph"
        ]
    },
    {
        id: 2,
        name: "SC/ST Scholarship Program",
        amount: "₹75,000",
        deadline: "2026-06-30",
        status: "Open",
        description: "Financial assistance for SC/ST students pursuing higher education",
        education: ["undergraduate", "postgraduate"],
        field: ["science", "commerce", "arts", "engineering", "medical", "law"],
        percentage: 60,
        income: "0-300000",
        category: ["sc", "st"],
        link: "https://scholarships.gov.in",
        documents: [
            "Caste Certificate",
            "Income Certificate (below ₹3 Lakhs)",
            "Previous Year Mark Sheets",
            "Admission Proof",
            "Aadhar Card"
        ]
    },
    {
        id: 3,
        name: "Girls Education Scholarship",
        amount: "₹60,000",
        deadline: "2026-04-20",
        status: "Open",
        description: "Encouraging female students to pursue higher education in all fields",
        education: ["12th", "undergraduate", "postgraduate"],
        field: ["science", "commerce", "arts", "engineering", "medical", "law"],
        percentage: 75,
        income: "0-600000",
        category: ["general", "obc", "sc", "st"],
        documents: [
            "Academic Transcripts",
            "Income Certificate",
            "Aadhar Card",
            "Gender Certificate",
            "Bank Details"
        ]
    },
    {
        id: 4,
        name: "Engineering Excellence Award",
        amount: "₹1,00,000",
        deadline: "2026-07-15",
        status: "Open",
        description: "Scholarship for exceptional engineering students across all branches",
        education: ["undergraduate"],
        field: ["engineering"],
        percentage: 90,
        income: "0-1000000",
        category: ["general", "obc", "sc", "st"],
        documents: [
            "JEE Score Card",
            "12th Mark Sheet",
            "College Admission Letter",
            "Income Certificate",
            "Project Portfolio (if any)"
        ]
    },
    {
        id: 5,
        name: "Medical Students Support",
        amount: "₹1,50,000",
        deadline: "2026-08-10",
        status: "Open",
        description: "Financial aid for MBBS and BDS students from economically weaker sections",
        education: ["undergraduate"],
        field: ["medical"],
        percentage: 85,
        income: "0-600000",
        category: ["general", "obc", "sc", "st"],
        documents: [
            "NEET Score Card",
            "Income Certificate",
            "Medical College Admission Proof",
            "Aadhar Card",
            "Fee Structure Document"
        ]
    },
    {
        id: 6,
        name: "Post Graduate Research Grant",
        amount: "₹2,00,000",
        deadline: "2026-09-30",
        status: "Soon",
        description: "Research grant for post-graduate students pursuing innovative projects",
        education: ["postgraduate", "doctorate"],
        field: ["science", "engineering", "medical"],
        percentage: 80,
        income: "0-1000000+",
        category: ["general", "obc", "sc", "st"],
        documents: [
            "Research Proposal",
            "Guide Recommendation Letter",
            "Academic Transcripts",
            "Project Synopsis",
            "Publication Record (if any)"
        ]
    },
    {
        id: 7,
        name: "Commerce Students Scholarship",
        amount: "₹40,000",
        deadline: "2026-05-25",
        status: "Open",
        description: "Supporting commerce stream students in their academic journey",
        education: ["12th", "undergraduate"],
        field: ["commerce"],
        percentage: 70,
        income: "0-600000",
        category: ["general", "obc", "sc", "st"],
        documents: [
            "10th and 12th Mark Sheets",
            "Income Certificate",
            "College ID Card",
            "Bank Account Details",
            "Aadhar Card"
        ]
    },
    {
        id: 8,
        name: "OBC Welfare Scholarship",
        amount: "₹50,000",
        deadline: "2026-06-15",
        status: "Open",
        description: "Financial assistance for OBC category students across all streams",
        education: ["undergraduate", "postgraduate"],
        field: ["science", "commerce", "arts", "engineering", "medical", "law"],
        percentage: 65,
        income: "0-300000",
        category: ["obc"],
        documents: [
            "OBC Certificate (Non-Creamy Layer)",
            "Income Certificate",
            "Academic Records",
            "Admission Proof",
            "Aadhar Card"
        ]
    },
    {
        id: 9,
        name: "Arts & Humanities Excellence",
        amount: "₹35,000",
        deadline: "2026-04-30",
        status: "Open",
        description: "Recognizing talent in arts, literature, and humanities",
        education: ["12th", "undergraduate", "postgraduate"],
        field: ["arts"],
        percentage: 75,
        income: "0-600000",
        category: ["general", "obc", "sc", "st"],
        documents: [
            "Portfolio of Work",
            "Academic Transcripts",
            "Income Certificate",
            "Recommendation Letters",
            "Aadhar Card"
        ]
    },
    {
        id: 10,
        name: "Law Students Grant",
        amount: "₹80,000",
        deadline: "2026-07-20",
        status: "Open",
        description: "Supporting aspiring lawyers and legal professionals",
        education: ["undergraduate", "postgraduate"],
        field: ["law"],
        percentage: 80,
        income: "0-1000000",
        category: ["general", "obc", "sc", "st"],
        documents: [
            "Law Entrance Exam Score",
            "Academic Certificates",
            "Income Certificate",
            "College Admission Letter",
            "Internship Records (if any)"
        ]
    },
    {
        id: 11,
        name: "Single Parent Family Support",
        amount: "₹55,000",
        deadline: "2026-05-10",
        status: "Open",
        description: "Special scholarship for students from single-parent households",
        education: ["10th", "12th", "undergraduate"],
        field: ["science", "commerce", "arts", "engineering", "medical", "law"],
        percentage: 60,
        income: "0-300000",
        category: ["general", "obc", "sc", "st", "other"],
        documents: [
            "Single Parent Declaration",
            "Income Certificate",
            "Death/Divorce Certificate (if applicable)",
            "Academic Records",
            "Aadhar Card"
        ]
    },
    {
        id: 12,
        name: "Minority Community Scholarship",
        amount: "₹45,000",
        deadline: "2026-06-05",
        status: "Open",
        description: "Educational support for students from minority communities",
        education: ["undergraduate", "postgraduate"],
        field: ["science", "commerce", "arts", "engineering", "medical", "law"],
        percentage: 65,
        income: "0-600000",
        category: ["other"],
        documents: [
            "Minority Community Certificate",
            "Income Certificate",
            "Academic Transcripts",
            "Admission Proof",
            "Aadhar Card"
        ]
    },
    {
        id: 13,
        name: "Rural Students Advancement",
        amount: "₹50,000",
        deadline: "2026-08-01",
        status: "Soon",
        description: "Empowering students from rural areas to access quality education",
        education: ["12th", "undergraduate"],
        field: ["science", "commerce", "arts", "engineering"],
        percentage: 70,
        income: "0-600000",
        category: ["general", "obc", "sc", "st"],
        documents: [
            "Rural Area Certificate",
            "Income Certificate",
            "Academic Certificates",
            "Domicile Certificate",
            "Aadhar Card"
        ]
    },
    {
        id: 14,
        name: "Differently Abled Students Support",
        amount: "₹70,000",
        deadline: "2026-05-30",
        status: "Open",
        description: "Special assistance for differently-abled students pursuing education",
        education: ["10th", "12th", "undergraduate", "postgraduate"],
        field: ["science", "commerce", "arts", "engineering", "medical", "law"],
        percentage: 50,
        income: "0-600000",
        category: ["general", "obc", "sc", "st", "other"],
        documents: [
            "Disability Certificate (40% or above)",
            "Medical Board Certificate",
            "Academic Records",
            "Income Certificate",
            "Aadhar Card"
        ]
    },
    {
        id: 15,
        name: "State Merit Scholarship",
        amount: "₹30,000",
        deadline: "2026-04-15",
        status: "Open",
        description: "State government scholarship for meritorious students",
        education: ["12th", "undergraduate"],
        field: ["science", "commerce", "arts", "engineering", "medical"],
        percentage: 85,
        income: "0-1000000",
        category: ["general", "obc", "sc", "st"],
        documents: [
            "12th Mark Sheet",
            "Domicile Certificate",
            "Income Certificate",
            "Bank Account Details",
            "College Admission Proof"
        ]
    }
];
