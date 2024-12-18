import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDivision, setSelectedDivision] = useState('');
    const [selectedExam, setSelectedExam] = useState('');
    const [lecturerInfo, setLecturerInfo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editedMarks, setEditedMarks] = useState({});

    const semesters = [
        { value: "3", label: "3rd Semester" },
        { value: "4", label: "4th Semester" },
        { value: "5", label: "5th Semester" },
        { value: "6", label: "6th Semester" },
        { value: "7", label: "7th Semester" },
        { value: "8", label: "8th Semester" }
    ];

    const divisions = [
        { value: "A", label: "A Section" },
        { value: "B", label: "B Section" }
    ];

    const semesterSubjects = {
        '3': ['Mathematics', 'Data Structures', 'Digital Electronics', 'Computer Organization'],
        '4': ['Mathematics', 'Analysis of Algorithms', 'Operating Systems', 'Microprocessors'],
        '5': ['Database Management', 'Computer Networks', 'Software Engineering', 'Theory of Computation'],
        '6': ['System Software', 'Web Technologies', 'Data Mining', 'Mobile Computing'],
        '7': ['DBMS', 'Machine Learning', 'Big Data Analytics', 'Cloud Computing'],
        '8': ['Internet of Things', 'Cryptography', 'Neural Networks', 'Image Processing']
    };

    const styles = {
        mainContainer: {
            minHeight: '100vh',
            backgroundColor: '#f0f2f5',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column'
        },
        pageWrapper: {
            flex: 1,
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '20px'
        },
        topBar: {
            width: '100%',
            backgroundColor: '#fff',
            padding: '15px 20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            marginBottom: '30px',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'flex-end'
        },
        welcomeText: {
            fontSize: '28px',
            fontWeight: '600',
            color: '#1a1a1a',
            marginBottom: '8px'
        },
        departmentText: {
            color: '#666',
            marginBottom: '30px',
            fontSize: '16px'
        },
        controlsSection: {
            backgroundColor: '#fff',
            padding: '25px',
            borderRadius: '12px',
            marginBottom: '24px',
            width: '100%',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
        selectionRow: {
            display: 'flex',
            gap: '20px',
            marginBottom: '20px',
            width: '100%'
        },
        selectGroup: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        selectLabel: {
            fontSize: '14px',
            color: '#666',
            fontWeight: '500',
            marginBottom: '4px'
        },
        select: {
            flex: 1,
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            backgroundColor: '#fff',
            fontSize: '14px',
            color: '#333',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            outline: 'none',
            '&:hover': {
                borderColor: '#3b82f6',
                boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)'
            },
            '&:focus': {
                borderColor: '#3b82f6',
                boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)'
            }
        },
        searchExportRow: {
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px'
        },
        searchInput: {
            flex: 1,
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            outline: 'none',
            backgroundColor: '#ffffff',
            color: '#000000',
            '&:focus': {
                borderColor: '#3b82f6',
                boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
                backgroundColor: '#ffffff'
            },
            '&::placeholder': {
                color: '#9ca3af'
            }
        },
        button: {
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
        },
        logoutButton: {
            backgroundColor: '#ef4444',
            color: '#fff',
            '&:hover': {
                backgroundColor: '#dc2626',
                transform: 'translateY(-1px)'
            }
        },
        exportButton: {
            backgroundColor: '#3b82f6',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            '&:hover': {
                backgroundColor: '#2563eb',
                transform: 'translateY(-1px)'
            },
            '&:disabled': {
                backgroundColor: '#94a3b8',
                cursor: 'not-allowed',
                transform: 'none'
            }
        },
        tableContainer: {
            backgroundColor: '#fff',
            padding: '25px',
            borderRadius: '12px',
            width: '100%',
            overflowX: 'auto',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        },
        table: {
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0',
            minWidth: '800px'
        },
        th: {
            padding: '16px',
            textAlign: 'left',
            borderBottom: '2px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            color: '#475569',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            '&:hover': {
                backgroundColor: '#f1f5f9'
            }
        },
        td: {
            padding: '16px',
            borderBottom: '1px solid #e2e8f0',
            color: '#1a1a1a',
            fontSize: '14px'
        },
        noDataMessage: {
            textAlign: 'center',
            padding: '40px',
            color: '#64748b',
            fontSize: '16px'
        },
        markInput: {
            width: '50px',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #e0e0e0',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            color: '#000000',
            '&:focus': {
                backgroundColor: '#ffffff'
            }
        },
        editButton: {
            backgroundColor: '#3b82f6',
            color: '#fff',
            marginRight: '8px'
        },
        saveButton: {
            backgroundColor: '#10b981',
            color: '#fff',
            marginRight: '8px'
        },
        cancelButton: {
            backgroundColor: '#ef4444',
            color: '#fff'
        },
        loadingContainer: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100vw',
            height: '100vh',
            backgroundColor: '#f0f2f5',
            zIndex: 9999
        },
        loadingSpinner: {
            width: '60px',
            height: '60px',
            border: '6px solid #f3f3f3',
            borderTop: '6px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
        },
        loadingText: {
            color: '#4b5563',
            fontSize: '1.4rem',
            fontWeight: '500',
            textAlign: 'center'
        },
        '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
        },
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        },
        dialog: {
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        },
        dialogTitle: {
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#1a1a1a'
        },
        dialogText: {
            marginBottom: '24px',
            color: '#4b5563'
        },
        dialogButtons: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
        },
        confirmButton: {
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer'
        }
    };

    const handleLogout = () => {
        console.log('Logout clicked'); // Debug log
        setShowLogoutDialog(true);
    };

    const confirmLogout = async () => {
        try {
            console.log('Confirming logout'); // Debug log
            await auth.signOut();
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleExport = () => {
        if (!assessments.length) return;

        // Create CSV headers
        const headers = [
            'USN',
            'Mark1',
            'Mark2',
            'Mark3',
            'Mark4',
            'Mark5',
            'Mark6',
            'Mark7',
            'Total'
        ];

        // Convert data to CSV format
        const csvData = [
            headers.join(','),
            ...assessments.map(assessment => [
                assessment.usn,
                assessment.individualMarks.Mark1,
                assessment.individualMarks.Mark2,
                assessment.individualMarks.Mark3,
                assessment.individualMarks.Mark4,
                assessment.individualMarks.Mark5,
                assessment.individualMarks.Mark6,
                assessment.individualMarks.Mark7,
                assessment.total
            ].join(','))
        ].join('\n');

        // Create and trigger download
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${selectedSubject}_${selectedClass}${selectedDivision}_${selectedExam}_marks.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Get lecturer info from Firestore
                    const lecturerRef = doc(db, 'lecturers', user.email);
                    console.log('Fetching lecturer info for:', user.email);
                    
                    const docSnap = await getDoc(lecturerRef);
                    console.log('Lecturer doc exists:', docSnap.exists());
                    
                    if (docSnap.exists()) {
                        const lecturerData = docSnap.data();
                        console.log('Lecturer data:', lecturerData);
                        
                        setLecturerInfo({
                            name: lecturerData.name || user.email,
                            department: lecturerData.department || 'Information Science and Engineering',
                            subjects: lecturerData.subjects || ['DBMS'] // Default subject if none found
                        });
                    } else {
                        // Set default info if no document exists
                        console.log('No lecturer document found, using defaults');
                        setLecturerInfo({
                            name: user.email,
                            department: 'Information Science and Engineering',
                            subjects: ['DBMS']
                        });
                    }
                } catch (error) {
                    console.error('Error fetching lecturer info:', error);
                    // Set default info on error
                    setLecturerInfo({
                        name: user.email,
                        department: 'Information Science and Engineering',
                        subjects: ['DBMS']
                    });
                }

                if (selectedSubject && selectedClass && selectedDivision && selectedExam) {
                    // Format collection name with underscore after email
                    const formattedCollectionName = `${user.email}_${selectedClass}_${selectedDivision}_${selectedExam}_${selectedSubject}`;
                    // Example: sanika@gmail.com_7_A_IA1_DBMS
                    
                    console.log('Original email:', user.email);
                    console.log('Attempting to access collection:', formattedCollectionName);

                    const marksRef = collection(db, formattedCollectionName);
                    
                    const unsubscribeMarks = onSnapshot(marksRef, (snapshot) => {
                        console.log('Snapshot exists:', !snapshot.empty);
                        console.log('Number of documents:', snapshot.size);
                        console.log('Documents:', snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        })));

                        const marksData = [];
                        snapshot.forEach((doc) => {
                            const data = doc.data();
                            console.log('Processing document:', data);

                            // Create marks string from individual marks
                            const marksString = `Mark1: ${data.Mark1 || 0}\n` +
                                              `Mark2: ${data.Mark2 || 0}\n` +
                                              `Mark3: ${data.Mark3 || 0}\n` +
                                              `Mark4: ${data.Mark4 || 0}\n` +
                                              `Mark5: ${data.Mark5 || 0}\n` +
                                              `Mark6: ${data.Mark6 || 0}\n` +
                                              `Mark7: ${data.Mark7 || 0}`;

                            marksData.push({
                                id: doc.id,
                                usn: doc.id, // Using document ID as USN
                                marks: marksString,
                                total: data.Total || 0,
                                individualMarks: {
                                    Mark1: data.Mark1 || 0,
                                    Mark2: data.Mark2 || 0,
                                    Mark3: data.Mark3 || 0,
                                    Mark4: data.Mark4 || 0,
                                    Mark5: data.Mark5 || 0,
                                    Mark6: data.Mark6 || 0,
                                    Mark7: data.Mark7 || 0
                                }
                            });
                        });

                        console.log('Final processed data:', marksData);
                        setAssessments(marksData);
                    });

                    return () => unsubscribeMarks();
                }
            } else {
                navigate('/');
            }
        });

        return () => unsubscribe();
    }, [navigate, selectedSubject, selectedClass, selectedDivision, selectedExam]);

    // Add handlers for new selections
    const handleClassChange = (e) => {
        setSelectedClass(e.target.value);
        setAssessments([]);
    };

    const handleDivisionChange = (e) => {
        setSelectedDivision(e.target.value);
        setAssessments([]);
    };

    const handleExamChange = (e) => {
        setSelectedExam(e.target.value);
        setAssessments([]);
    };

    // Update the calculateBestFive function to handle the marks object correctly
    const calculateBestFive = (marks) => {
        // Extract just the mark values from the marks object
        const scores = [
            marks.Mark1 || 0,
            marks.Mark2 || 0,
            marks.Mark3 || 0,
            marks.Mark4 || 0,
            marks.Mark5 || 0,
            marks.Mark6 || 0,
            marks.Mark7 || 0
        ];
        // Sort in descending order and take top 5
        scores.sort((a, b) => b - a);
        return scores.slice(0, 5).reduce((sum, score) => sum + score, 0);
    };

    // Update the handleSaveMarks function
    const handleSaveMarks = async (usn) => {
        try {
            // Show loading toast
            const toastId = toast.loading("Updating marks...");
            
            // Calculate new total from best 5 marks
            const newTotal = calculateBestFive(editedMarks);
            
            // Create the data to update
            const updateData = {
                Mark1: editedMarks.Mark1 || 0,
                Mark2: editedMarks.Mark2 || 0,
                Mark3: editedMarks.Mark3 || 0,
                Mark4: editedMarks.Mark4 || 0,
                Mark5: editedMarks.Mark5 || 0,
                Mark6: editedMarks.Mark6 || 0,
                Mark7: editedMarks.Mark7 || 0,
                Total: newTotal
            };

            // Get the correct collection name
            const formattedCollectionName = `${auth.currentUser.email}_${selectedClass}_${selectedDivision}_${selectedExam}_${selectedSubject}`;
            
            // Update Firestore
            const docRef = doc(db, formattedCollectionName, usn);
            await updateDoc(docRef, updateData);

            // Update local state
            setAssessments(prev => prev.map(assessment => {
                if (assessment.id === usn) {
                    return {
                        ...assessment,
                        individualMarks: {
                            Mark1: editedMarks.Mark1 || assessment.individualMarks.Mark1,
                            Mark2: editedMarks.Mark2 || assessment.individualMarks.Mark2,
                            Mark3: editedMarks.Mark3 || assessment.individualMarks.Mark3,
                            Mark4: editedMarks.Mark4 || assessment.individualMarks.Mark4,
                            Mark5: editedMarks.Mark5 || assessment.individualMarks.Mark5,
                            Mark6: editedMarks.Mark6 || assessment.individualMarks.Mark6,
                            Mark7: editedMarks.Mark7 || assessment.individualMarks.Mark7
                        },
                        total: newTotal
                    };
                }
                return assessment;
            }));

            // Update successful - update the loading toast
            toast.update(toastId, {
                render: "Marks updated successfully! 🎉",
                type: "success",
                isLoading: false,
                autoClose: 3000,
                closeButton: true
            });

            setEditingId(null);
            setEditedMarks({});
        } catch (error) {
            console.error('Error updating marks:', error);
            // Show error toast
            toast.error("Failed to update marks. Please try again.", {
                position: "top-right",
                autoClose: 3000
            });
        }
    };

    const spinKeyframes = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;

    if (!lecturerInfo) {
        return (
            <div style={styles.loadingContainer}>
                <style>{spinKeyframes}</style>
                <div style={styles.loadingSpinner}></div>
                <div style={styles.loadingText}>Loading Dashboard...</div>
            </div>
        );
    }

    return (
        <div style={styles.mainContainer}>
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                style={{ width: 'auto', minWidth: '300px' }}
            />
            <div style={styles.pageWrapper}>
                <div style={styles.topBar}>
                    <button 
                        onClick={handleLogout} 
                        style={{...styles.button, ...styles.logoutButton}}
                    >
                        Logout
                    </button>
                </div>

                <div style={styles.contentWrapper}>
                    <h1 style={styles.welcomeText}>Welcome back, {lecturerInfo?.name}</h1>
                    <p style={styles.departmentText}>{lecturerInfo?.department}</p>

                    <div style={styles.controlsSection}>
                        <div style={styles.selectionRow}>
                            <div style={styles.selectGroup}>
                                <label style={styles.selectLabel}>Semester</label>
                                <select 
                                    value={selectedClass}
                                    onChange={handleClassChange}
                                    style={styles.select}
                                >
                                    <option value="">Select Semester</option>
                                    {semesters.map(sem => (
                                        <option key={sem.value} value={sem.value}>
                                            {sem.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.selectGroup}>
                                <label style={styles.selectLabel}>Division</label>
                                <select 
                                    value={selectedDivision}
                                    onChange={handleDivisionChange}
                                    style={styles.select}
                                >
                                    <option value="">Select Division</option>
                                    {divisions.map(div => (
                                        <option key={div.value} value={div.value}>
                                            {div.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={styles.selectionRow}>
                            <div style={styles.selectGroup}>
                                <label style={styles.selectLabel}>Exam</label>
                                <select 
                                    value={selectedExam}
                                    onChange={handleExamChange}
                                    style={styles.select}
                                >
                                    <option value="">Select Exam</option>
                                    <option value="IA1">IA1</option>
                                    <option value="IA2">IA2</option>
                                </select>
                            </div>

                            <div style={styles.selectGroup}>
                                <label style={styles.selectLabel}>Subject</label>
                                <select 
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    style={styles.select}
                                    disabled={!selectedClass}
                                >
                                    <option value="">Select Subject</option>
                                    {selectedClass && semesterSubjects[selectedClass]?.map(subject => (
                                        <option key={subject} value={subject}>
                                            {subject}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={styles.searchExportRow}>
                            <input
                                type="text"
                                placeholder="Search by USN..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={styles.searchInput}
                            />
                            <button 
                                onClick={handleExport}
                                style={{...styles.button, ...styles.exportButton}}
                                disabled={!assessments.length}
                            >
                                Export to CSV
                            </button>
                        </div>
                    </div>

                    <div style={styles.tableContainer}>
                        {assessments.length > 0 ? (
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>USN</th>
                                        <th style={styles.th}>Mark1</th>
                                        <th style={styles.th}>Mark2</th>
                                        <th style={styles.th}>Mark3</th>
                                        <th style={styles.th}>Mark4</th>
                                        <th style={styles.th}>Mark5</th>
                                        <th style={styles.th}>Mark6</th>
                                        <th style={styles.th}>Mark7</th>
                                        <th style={styles.th}>Total</th>
                                        <th style={styles.th}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assessments
                                        .filter(assessment => {
                                            return assessment && assessment.usn && 
                                                assessment.usn.toLowerCase().includes(searchTerm.toLowerCase());
                                        })
                                        .map((assessment) => (
                                            <tr key={assessment.id}>
                                                <td style={styles.td}>{assessment.usn}</td>
                                                {editingId === assessment.id ? (
                                                    // Edit Mode
                                                    <>
                                                        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                                                            <td key={num} style={styles.td}>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="5"
                                                                    value={editedMarks[`Mark${num}`] || assessment.individualMarks[`Mark${num}`]}
                                                                    onChange={(e) => {
                                                                        const value = Math.min(5, Math.max(0, parseInt(e.target.value) || 0));
                                                                        setEditedMarks(prev => ({
                                                                            ...prev,
                                                                            [`Mark${num}`]: value
                                                                        }));
                                                                    }}
                                                                    style={styles.markInput}
                                                                />
                                                            </td>
                                                        ))}
                                                        <td style={styles.td}>
                                                            {calculateBestFive(editedMarks) || assessment.total}
                                                        </td>
                                                        <td style={styles.td}>
                                                            <button 
                                                                onClick={() => handleSaveMarks(assessment.id)}
                                                                style={{...styles.button, ...styles.saveButton}}
                                                            >
                                                                Save
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    setEditingId(null);
                                                                    setEditedMarks({});
                                                                }}
                                                                style={{...styles.button, ...styles.cancelButton}}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </td>
                                                    </>
                                                ) : (
                                                    // View Mode
                                                    <>
                                                        <td style={styles.td}>{assessment.individualMarks.Mark1}</td>
                                                        <td style={styles.td}>{assessment.individualMarks.Mark2}</td>
                                                        <td style={styles.td}>{assessment.individualMarks.Mark3}</td>
                                                        <td style={styles.td}>{assessment.individualMarks.Mark4}</td>
                                                        <td style={styles.td}>{assessment.individualMarks.Mark5}</td>
                                                        <td style={styles.td}>{assessment.individualMarks.Mark6}</td>
                                                        <td style={styles.td}>{assessment.individualMarks.Mark7}</td>
                                                        <td style={styles.td}>{assessment.total}</td>
                                                        <td style={styles.td}>
                                                            <button 
                                                                onClick={() => {
                                                                    setEditingId(assessment.id);
                                                                    setEditedMarks(assessment.individualMarks);
                                                                }}
                                                                style={{...styles.button, ...styles.editButton}}
                                                            >
                                                                Edit
                                                            </button>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={styles.noDataMessage}>
                                Select all options to view marks data
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showLogoutDialog && (
                <div style={styles.overlay}>
                    <div style={styles.dialog}>
                        <h2 style={styles.dialogTitle}>Confirm Logout</h2>
                        <p style={styles.dialogText}>
                            Are you sure you want to log out?
                        </p>
                        <div style={styles.dialogButtons}>
                            <button 
                                onClick={() => setShowLogoutDialog(false)} 
                                style={{...styles.button, ...styles.cancelButton}}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmLogout} 
                                style={{...styles.button, ...styles.confirmButton}}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;