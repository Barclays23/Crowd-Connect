// Mock data for Crowd Connect Admin Dashboard

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'User' | 'Host' | 'Admin'
  status: 'Active' | 'Suspended' | 'Pending'
  joinDate: string
  avatar?: string
}

export interface Category {
  id: string
  name: string
  subtypes: string[]
  eventsCount: number
  status: 'Active' | 'Inactive'
  createdAt: string
}

export interface HostSlab {
  id: string
  name: string
  minParticipants: number
  maxParticipants: number | null
  fee: number
  description: string
  status: 'Active' | 'Inactive'
  createdAt: string
}

export interface Event {
  id: string
  title: string
  hostName: string
  startDate: string
  endDate: string
  location: string
  category: string
  poster: string
  ticketsSold: number
  maxCapacity: number
  revenue: number
  status: 'Draft' | 'Published' | 'Cancelled' | 'Postponed' | 'Completed'
  eventMode: 'Offline' | 'Online'
}

export interface Booking {
  id: string
  eventName: string
  location: string
  eventDate: string
  bookedBy: string
  userEmail: string
  ticketsBooked: number
  ticketNumbers: string[]
  amountPaid: number
  paymentStatus: 'Paid' | 'Pending' | 'Refunded' | 'Failed'
  bookingDate: string
  status: 'Active' | 'Cancelled' | 'Refunded' | 'Attended'
}

export interface Payment {
  no: number
  date: string
  hostUserName: string
  category: string
  bookingId: string
  eventId: string
  tickets: number
  amount: number
  paymentStatus: 'Paid' | 'Pending' | 'Refunded' | 'Failed'
}

export interface PayoutRequest {
  date: string
  eventId: string
  eventName: string
  hostName: string
  totalEarnings: number
  adminCommission: number
  hostShare: number
  approvedDate: string | null
  status: 'Pending' | 'Approved' | 'Rejected' | 'Processing'
}

export interface Review {
  no: number
  date: string
  userName: string
  category: string
  eventId: string
  rating: number
  comment: string
  showHide: 'Show' | 'Hide'
  approvalStatus: 'Approved' | 'Pending' | 'Rejected'
}

// Mock Users Data
export const mockUsers: User[] = [
  { id: 'U001', name: 'Arjun Sharma', email: 'arjun.sharma@gmail.com', phone: '+91-9876543210', role: 'User', status: 'Active', joinDate: '15 Jan 2024' },
  { id: 'U002', name: 'Priya Patel', email: 'priya.patel@yahoo.com', phone: '+91-8765432109', role: 'Host', status: 'Active', joinDate: '22 Jan 2024' },
  { id: 'U003', name: 'Rohit Kumar', email: 'rohit.kumar@hotmail.com', phone: '+91-7654321098', role: 'User', status: 'Suspended', joinDate: '08 Feb 2024' },
  { id: 'U004', name: 'Sneha Gupta', email: 'sneha.gupta@gmail.com', phone: '+91-6543210987', role: 'Admin', status: 'Active', joinDate: '12 Feb 2024' },
  { id: 'U005', name: 'Vikash Singh', email: 'vikash.singh@outlook.com', phone: '+91-5432109876', role: 'Host', status: 'Pending', joinDate: '25 Feb 2024' },
  { id: 'U006', name: 'Anita Desai', email: 'anita.desai@gmail.com', phone: '+91-4321098765', role: 'User', status: 'Active', joinDate: '03 Mar 2024' },
  { id: 'U007', name: 'Karan Joshi', email: 'karan.joshi@rediffmail.com', phone: '+91-3210987654', role: 'User', status: 'Active', joinDate: '18 Mar 2024' },
  { id: 'U008', name: 'Meera Agrawal', email: 'meera.agrawal@gmail.com', phone: '+91-2109876543', role: 'Host', status: 'Active', joinDate: '25 Mar 2024' },
  { id: 'U009', name: 'Raj Verma', email: 'raj.verma@yahoo.com', phone: '+91-1098765432', role: 'User', status: 'Pending', joinDate: '05 Apr 2024' },
  { id: 'U010', name: 'Sanjana Reddy', email: 'sanjana.reddy@gmail.com', phone: '+91-9087654321', role: 'User', status: 'Active', joinDate: '12 Apr 2024' },
]

// Mock Categories Data
export const mockCategories: Category[] = [
  { id: 'C001', name: 'Entertainment', subtypes: ['Music', 'Comedy', 'Theater', 'Dance'], eventsCount: 24, status: 'Active', createdAt: '10 Jan 2024' },
  { id: 'C002', name: 'Education', subtypes: ['Workshops', 'Seminars', 'Online Classes'], eventsCount: 18, status: 'Active', createdAt: '15 Jan 2024' },
  { id: 'C003', name: 'Lifestyle', subtypes: ['Fitness', 'Wellness', 'Fashion', 'Food & Drink'], eventsCount: 31, status: 'Active', createdAt: '20 Jan 2024' },
  { id: 'C004', name: 'Sports', subtypes: ['Cricket', 'Football', 'Basketball', 'Tennis'], eventsCount: 15, status: 'Active', createdAt: '25 Jan 2024' },
  { id: 'C005', name: 'Family & Community', subtypes: ['Kids Events', 'Family Fun', 'Community Gatherings'], eventsCount: 12, status: 'Active', createdAt: '01 Feb 2024' },
  { id: 'C006', name: 'Corporate', subtypes: ['Networking', 'Team Building', 'Conferences'], eventsCount: 8, status: 'Inactive', createdAt: '05 Feb 2024' },
]

// Mock Host Slabs Data
export const mockHostSlabs: HostSlab[] = [
  { id: 'S001', name: 'Small', minParticipants: 1, maxParticipants: 50, fee: 100, description: 'Perfect for small gatherings', status: 'Active', createdAt: '01 Jan 2024' },
  { id: 'S002', name: 'Medium', minParticipants: 51, maxParticipants: 200, fee: 250, description: 'Ideal for medium-sized events', status: 'Active', createdAt: '01 Jan 2024' },
  { id: 'S003', name: 'Large', minParticipants: 201, maxParticipants: 1000, fee: 500, description: 'Great for large events', status: 'Active', createdAt: '01 Jan 2024' },
  { id: 'S004', name: 'Premium', minParticipants: 1001, maxParticipants: null, fee: 1000, description: 'Unlimited capacity for premium events', status: 'Active', createdAt: '01 Jan 2024' },
]

// Mock Events Data
export const mockEvents: Event[] = [
  { id: 'E001', title: 'Mumbai Music Festival 2024', hostName: 'Priya Patel', startDate: '15 May 2024', endDate: '16 May 2024', location: 'Mumbai', category: 'Entertainment', poster: '/event1.jpg', ticketsSold: 120, maxCapacity: 200, revenue: 24000, status: 'Published', eventMode: 'Offline' },
  { id: 'E002', title: 'Tech Workshop: React Masterclass', hostName: 'Vikash Singh', startDate: '22 May 2024', endDate: '22 May 2024', location: 'Bangalore', category: 'Education', poster: '/event2.jpg', ticketsSold: 45, maxCapacity: 60, revenue: 22500, status: 'Published', eventMode: 'Online' },
  { id: 'E003', title: 'Yoga & Meditation Retreat', hostName: 'Meera Agrawal', startDate: '28 May 2024', endDate: '30 May 2024', location: 'Goa', category: 'Lifestyle', poster: '/event3.jpg', ticketsSold: 35, maxCapacity: 50, revenue: 17500, status: 'Published', eventMode: 'Offline' },
  { id: 'E004', title: 'Cricket Championship 2024', hostName: 'Arjun Sharma', startDate: '05 Jun 2024', endDate: '07 Jun 2024', location: 'Delhi', category: 'Sports', poster: '/event4.jpg', ticketsSold: 180, maxCapacity: 300, revenue: 54000, status: 'Published', eventMode: 'Offline' },
  { id: 'E005', title: 'Kids Art & Craft Workshop', hostName: 'Anita Desai', startDate: '12 Jun 2024', endDate: '12 Jun 2024', location: 'Pune', category: 'Family & Community', poster: '/event5.jpg', ticketsSold: 25, maxCapacity: 40, revenue: 5000, status: 'Draft', eventMode: 'Offline' },
  { id: 'E006', title: 'Startup Networking Event', hostName: 'Sneha Gupta', startDate: '18 Jun 2024', endDate: '18 Jun 2024', location: 'Hyderabad', category: 'Corporate', poster: '/event6.jpg', ticketsSold: 60, maxCapacity: 100, revenue: 30000, status: 'Cancelled', eventMode: 'Online' },
]

// Mock Bookings Data
export const mockBookings: Booking[] = [
  { id: 'B001', eventName: 'Mumbai Music Festival 2024', location: 'Mumbai', eventDate: '15 May 2024', bookedBy: 'Arjun Sharma', userEmail: 'arjun.sharma@gmail.com', ticketsBooked: 2, ticketNumbers: ['MMF24001', 'MMF24002'], amountPaid: 400, paymentStatus: 'Paid', bookingDate: '10 Apr 2024', status: 'Active' },
  { id: 'B002', eventName: 'Tech Workshop: React Masterclass', location: 'Bangalore', eventDate: '22 May 2024', bookedBy: 'Karan Joshi', userEmail: 'karan.joshi@rediffmail.com', ticketsBooked: 1, ticketNumbers: ['RM24001'], amountPaid: 500, paymentStatus: 'Paid', bookingDate: '12 Apr 2024', status: 'Active' },
  { id: 'B003', eventName: 'Yoga & Meditation Retreat', location: 'Goa', eventDate: '28 May 2024', bookedBy: 'Sanjana Reddy', userEmail: 'sanjana.reddy@gmail.com', ticketsBooked: 1, ticketNumbers: ['YMR24001'], amountPaid: 500, paymentStatus: 'Pending', bookingDate: '15 Apr 2024', status: 'Active' },
  { id: 'B004', eventName: 'Cricket Championship 2024', location: 'Delhi', eventDate: '05 Jun 2024', bookedBy: 'Rohit Kumar', userEmail: 'rohit.kumar@hotmail.com', ticketsBooked: 3, ticketNumbers: ['CC24001', 'CC24002', 'CC24003'], amountPaid: 900, paymentStatus: 'Refunded', bookingDate: '18 Apr 2024', status: 'Refunded' },
  { id: 'B005', eventName: 'Kids Art & Craft Workshop', location: 'Pune', eventDate: '12 Jun 2024', bookedBy: 'Anita Desai', userEmail: 'anita.desai@gmail.com', ticketsBooked: 2, ticketNumbers: ['ACW24001', 'ACW24002'], amountPaid: 400, paymentStatus: 'Paid', bookingDate: '20 Apr 2024', status: 'Active' },
  { id: 'B006', eventName: 'Startup Networking Event', location: 'Hyderabad', eventDate: '18 Jun 2024', bookedBy: 'Raj Verma', userEmail: 'raj.verma@yahoo.com', ticketsBooked: 1, ticketNumbers: ['SNE24001'], amountPaid: 500, paymentStatus: 'Failed', bookingDate: '22 Apr 2024', status: 'Cancelled' },
  { id: 'B007', eventName: 'Mumbai Music Festival 2024', location: 'Mumbai', eventDate: '15 May 2024', bookedBy: 'Meera Agrawal', userEmail: 'meera.agrawal@gmail.com', ticketsBooked: 4, ticketNumbers: ['MMF24003', 'MMF24004', 'MMF24005', 'MMF24006'], amountPaid: 800, paymentStatus: 'Paid', bookingDate: '25 Apr 2024', status: 'Attended' },
  { id: 'B008', eventName: 'Tech Workshop: React Masterclass', location: 'Bangalore', eventDate: '22 May 2024', bookedBy: 'Priya Patel', userEmail: 'priya.patel@yahoo.com', ticketsBooked: 1, ticketNumbers: ['RM24002'], amountPaid: 500, paymentStatus: 'Paid', bookingDate: '28 Apr 2024', status: 'Active' },
  { id: 'B009', eventName: 'Yoga & Meditation Retreat', location: 'Goa', eventDate: '28 May 2024', bookedBy: 'Vikash Singh', userEmail: 'vikash.singh@outlook.com', ticketsBooked: 2, ticketNumbers: ['YMR24002', 'YMR24003'], amountPaid: 1000, paymentStatus: 'Paid', bookingDate: '02 May 2024', status: 'Active' },
  { id: 'B010', eventName: 'Cricket Championship 2024', location: 'Delhi', eventDate: '05 Jun 2024', bookedBy: 'Sneha Gupta', userEmail: 'sneha.gupta@gmail.com', ticketsBooked: 2, ticketNumbers: ['CC24004', 'CC24005'], amountPaid: 600, paymentStatus: 'Paid', bookingDate: '05 May 2024', status: 'Active' },
]

// Mock Payments Data
export const mockPayments: Payment[] = [
  { no: 1, date: '10 Apr 2024', hostUserName: 'Priya Patel', category: 'Entertainment', bookingId: 'B001', eventId: 'E001', tickets: 2, amount: 400, paymentStatus: 'Paid' },
  { no: 2, date: '12 Apr 2024', hostUserName: 'Vikash Singh', category: 'Education', bookingId: 'B002', eventId: 'E002', tickets: 1, amount: 500, paymentStatus: 'Paid' },
  { no: 3, date: '15 Apr 2024', hostUserName: 'Meera Agrawal', category: 'Lifestyle', bookingId: 'B003', eventId: 'E003', tickets: 1, amount: 500, paymentStatus: 'Pending' },
  { no: 4, date: '18 Apr 2024', hostUserName: 'Arjun Sharma', category: 'Sports', bookingId: 'B004', eventId: 'E004', tickets: 3, amount: 900, paymentStatus: 'Refunded' },
  { no: 5, date: '20 Apr 2024', hostUserName: 'Anita Desai', category: 'Family & Community', bookingId: 'B005', eventId: 'E005', tickets: 2, amount: 400, paymentStatus: 'Paid' },
  { no: 6, date: '22 Apr 2024', hostUserName: 'Sneha Gupta', category: 'Corporate', bookingId: 'B006', eventId: 'E006', tickets: 1, amount: 500, paymentStatus: 'Failed' },
  { no: 7, date: '25 Apr 2024', hostUserName: 'Priya Patel', category: 'Entertainment', bookingId: 'B007', eventId: 'E001', tickets: 4, amount: 800, paymentStatus: 'Paid' },
  { no: 8, date: '28 Apr 2024', hostUserName: 'Vikash Singh', category: 'Education', bookingId: 'B008', eventId: 'E002', tickets: 1, amount: 500, paymentStatus: 'Paid' },
  { no: 9, date: '02 May 2024', hostUserName: 'Meera Agrawal', category: 'Lifestyle', bookingId: 'B009', eventId: 'E003', tickets: 2, amount: 1000, paymentStatus: 'Paid' },
  { no: 10, date: '05 May 2024', hostUserName: 'Arjun Sharma', category: 'Sports', bookingId: 'B010', eventId: 'E004', tickets: 2, amount: 600, paymentStatus: 'Paid' },
]

// Mock Payout Requests Data
export const mockPayoutRequests: PayoutRequest[] = [
  { date: '20 May 2024', eventId: 'E001', eventName: 'Mumbai Music Festival 2024', hostName: 'Priya Patel', totalEarnings: 24000, adminCommission: 2400, hostShare: 21600, approvedDate: '22 May 2024', status: 'Approved' },
  { date: '25 May 2024', eventId: 'E002', eventName: 'Tech Workshop: React Masterclass', hostName: 'Vikash Singh', totalEarnings: 22500, adminCommission: 2250, hostShare: 20250, approvedDate: '27 May 2024', status: 'Approved' },
  { date: '01 Jun 2024', eventId: 'E003', eventName: 'Yoga & Meditation Retreat', hostName: 'Meera Agrawal', totalEarnings: 17500, adminCommission: 1750, hostShare: 15750, approvedDate: null, status: 'Pending' },
  { date: '10 Jun 2024', eventId: 'E004', eventName: 'Cricket Championship 2024', hostName: 'Arjun Sharma', totalEarnings: 54000, adminCommission: 5400, hostShare: 48600, approvedDate: '12 Jun 2024', status: 'Processing' },
  { date: '15 Jun 2024', eventId: 'E005', eventName: 'Kids Art & Craft Workshop', hostName: 'Anita Desai', totalEarnings: 5000, adminCommission: 500, hostShare: 4500, approvedDate: null, status: 'Pending' },
  { date: '20 Jun 2024', eventId: 'E006', eventName: 'Startup Networking Event', hostName: 'Sneha Gupta', totalEarnings: 30000, adminCommission: 3000, hostShare: 27000, approvedDate: null, status: 'Rejected' },
]

// Mock Reviews Data
export const mockReviews: Review[] = [
  { no: 1, date: '16 May 2024', userName: 'Arjun Sharma', category: 'Entertainment', eventId: 'E001', rating: 5, comment: 'Amazing experience! The music was fantastic and the venue was perfect.', showHide: 'Show', approvalStatus: 'Approved' },
  { no: 2, date: '23 May 2024', userName: 'Karan Joshi', category: 'Education', eventId: 'E002', rating: 4, comment: 'Great workshop, learned a lot about React. Instructor was knowledgeable.', showHide: 'Show', approvalStatus: 'Approved' },
  { no: 3, date: '31 May 2024', userName: 'Sanjana Reddy', category: 'Lifestyle', eventId: 'E003', rating: 5, comment: 'Best retreat ever! Peaceful location and excellent yoga sessions.', showHide: 'Show', approvalStatus: 'Approved' },
  { no: 4, date: '08 Jun 2024', userName: 'Rohit Kumar', category: 'Sports', eventId: 'E004', rating: 3, comment: 'Good event but seating arrangement could have been better.', showHide: 'Show', approvalStatus: 'Approved' },
  { no: 5, date: '13 Jun 2024', userName: 'Anita Desai', category: 'Family & Community', eventId: 'E005', rating: 5, comment: 'Kids loved it! Very creative and engaging activities.', showHide: 'Show', approvalStatus: 'Pending' },
  { no: 6, date: '19 Jun 2024', userName: 'Raj Verma', category: 'Corporate', eventId: 'E006', rating: 2, comment: 'Event was cancelled without proper notice. Very disappointing.', showHide: 'Hide', approvalStatus: 'Rejected' },
  { no: 7, date: '17 May 2024', userName: 'Meera Agrawal', category: 'Entertainment', eventId: 'E001', rating: 4, comment: 'Good lineup of artists. Would recommend to music lovers.', showHide: 'Show', approvalStatus: 'Approved' },
  { no: 8, date: '24 May 2024', userName: 'Priya Patel', category: 'Education', eventId: 'E002', rating: 5, comment: 'Excellent content and hands-on examples. Worth every penny!', showHide: 'Show', approvalStatus: 'Approved' },
  { no: 9, date: '01 Jun 2024', userName: 'Vikash Singh', category: 'Lifestyle', eventId: 'E003', rating: 5, comment: 'Transformative experience. The meditation sessions were incredible.', showHide: 'Show', approvalStatus: 'Pending' },
  { no: 10, date: '09 Jun 2024', userName: 'Sneha Gupta', category: 'Sports', eventId: 'E004', rating: 4, comment: 'Exciting matches and great atmosphere. Will attend again!', showHide: 'Show', approvalStatus: 'Approved' },
]