const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const ProjectListing = require('../models/ProjectListing');
const Project = require('../models/Project');

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://adminuser:test12345gigbased@cluster0.bbxul.mongodb.net/gigBased?retryWrites=true&w=majority&appName=Cluster0';
    console.log('Using MongoDB URI:', MONGODB_URI.substring(0, 50) + '...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const sampleProjectListings = [
  {
    title: 'E-commerce Mobile App Development',
    description: 'Looking for experienced React Native developers to build a cross-platform e-commerce mobile application with payment integration.',
    budget: 2.5,
    currency: 'ETH',
    duration: '3 months',
    skillsRequired: ['React Native', 'TypeScript', 'Node.js', 'MongoDB'],
    location: 'Remote',
    urgency: 'medium',
    status: 'active',
    clientId: 'client_001',
    clientWallet: '0x1234567890123456789012345678901234567890',
    applicants: []
  },
  {
    title: 'Smart Contract Development for DeFi Platform',
    description: 'Need Solidity experts to develop and audit smart contracts for a new DeFi lending platform on Base Chain.',
    budget: 4.2,
    currency: 'ETH',
    duration: '2 months',
    skillsRequired: ['Solidity', 'Web3', 'DeFi', 'Security Auditing'],
    location: 'Remote',
    urgency: 'high',
    status: 'closed',
    clientId: 'client_001',
    clientWallet: '0x1234567890123456789012345678901234567890',
    applicants: [
      {
        developerId: 'dev_001',
        developerWallet: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        githubUsername: 'alice-blockchain',
        proposal: 'I have 5+ years of experience in Solidity development and DeFi protocols.',
        proposedBudget: 4.0
      }
    ]
  },
  {
    title: 'UI/UX Design for SaaS Dashboard',
    description: 'Seeking creative designers to redesign our SaaS platform dashboard with modern UI/UX principles.',
    budget: 1.8,
    currency: 'ETH',
    duration: '6 weeks',
    skillsRequired: ['Figma', 'UI/UX Design', 'Prototyping', 'User Research'],
    location: 'Remote',
    urgency: 'low',
    status: 'draft',
    clientId: 'client_001',
    clientWallet: '0x1234567890123456789012345678901234567890',
    applicants: []
  }
];

const sampleProjects = [
  {
    title: 'Smart Contract Development for DeFi Platform',
    description: 'Developing and auditing smart contracts for a new DeFi lending platform on Base Chain.',
    budget: 4.2,
    currency: 'ETH',
    clientId: 'client_001',
    clientWallet: '0x1234567890123456789012345678901234567890',
    assignedDeveloper: {
      developerId: 'dev_001',
      name: 'Alice Johnson',
      avatar: 'AJ',
      githubUsername: 'alice-blockchain',
      walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
    },
    timeline: {
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-15'),
      milestones: [
        {
          title: 'Smart Contract Architecture',
          description: 'Design the overall architecture and contract interfaces',
          dueDate: new Date('2024-02-01'),
          status: 'completed',
          completedAt: new Date('2024-01-30')
        },
        {
          title: 'Contract Development',
          description: 'Implement the core smart contracts',
          dueDate: new Date('2024-02-20'),
          status: 'in_progress'
        },
        {
          title: 'Security Audit',
          description: 'Conduct thorough security audit and testing',
          dueDate: new Date('2024-03-10'),
          status: 'pending'
        }
      ]
    },
    status: 'in_progress',
    progress: 65,
    contractAddress: '0x1111222233334444555566667777888899990000',
    transactionHash: '0xaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccdd'
  },
  {
    title: 'Mobile App UI/UX Redesign',
    description: 'Complete redesign of mobile application user interface and user experience.',
    budget: 2.1,
    currency: 'ETH',
    clientId: 'client_001',
    clientWallet: '0x1234567890123456789012345678901234567890',
    assignedDeveloper: {
      developerId: 'dev_002',
      name: 'Bob Designer',
      avatar: 'BD',
      githubUsername: 'bob-designs',
      walletAddress: '0x9876543210987654321098765432109876543210'
    },
    timeline: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-02-15'),
      milestones: [
        {
          title: 'User Research',
          description: 'Conduct user interviews and research',
          dueDate: new Date('2024-01-10'),
          status: 'completed',
          completedAt: new Date('2024-01-09')
        },
        {
          title: 'Design System',
          description: 'Create comprehensive design system',
          dueDate: new Date('2024-01-25'),
          status: 'completed',
          completedAt: new Date('2024-01-24')
        },
        {
          title: 'Final Implementation',
          description: 'Implement final designs and handoff',
          dueDate: new Date('2024-02-15'),
          status: 'completed',
          completedAt: new Date('2024-02-14')
        }
      ]
    },
    status: 'completed',
    progress: 100,
    contractAddress: '0x2222333344445555666677778888999900001111',
    transactionHash: '0xbbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaa',
    paymentHistory: [
      {
        amount: 0.7,
        transactionHash: '0xccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabb',
        milestone: 'User Research',
        paidAt: new Date('2024-01-11')
      },
      {
        amount: 0.7,
        transactionHash: '0xddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbcc',
        milestone: 'Design System',
        paidAt: new Date('2024-01-26')
      },
      {
        amount: 0.7,
        transactionHash: '0xaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccdd',
        milestone: 'Final Implementation',
        paidAt: new Date('2024-02-16')
      }
    ]
  }
];

const seedData = async () => {
  try {
    // Clear existing data
    await ProjectListing.deleteMany({});
    await Project.deleteMany({});
    console.log('Cleared existing data');

    // Seed project listings
    const listings = await ProjectListing.insertMany(sampleProjectListings);
    console.log(`Created ${listings.length} project listings`);

    // Update projects with actual listing IDs
    sampleProjects[0].originalListingId = listings[1]._id; // DeFi project
    sampleProjects[1].originalListingId = listings[2]._id; // UI/UX project

    // Seed projects
    const projects = await Project.insertMany(sampleProjects);
    console.log(`Created ${projects.length} projects`);

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
};

runSeed(); 