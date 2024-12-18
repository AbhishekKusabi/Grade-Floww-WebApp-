import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase/config';

function MarksDisplay() {
  const [studentMarks, setStudentMarks] = useState([]);

  useEffect(() => {
    // Reference to your marks data in Firebase
    const marksRef = ref(database, 'marks'); // Adjust path based on your database structure
    
    // Set up real-time listener
    const unsubscribe = onValue(marksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert the data to an array format
        const marksArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setStudentMarks(marksArray);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return (
    <div className="marks-container">
      <h2>Student Marks</h2>
      <table className="marks-table">
        <thead>
          <tr>
            <th>USN</th>
            <th>Total Marks</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {studentMarks.map((student) => (
            <tr key={student.id}>
              <td>{student.usn}</td>
              <td>{student.totalMarks}</td>
              <td>{new Date(student.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MarksDisplay; 