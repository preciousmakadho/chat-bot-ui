import { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import MicIcon from '@mui/icons-material/Mic'; 

import FastRewindIcon from '@mui/icons-material/FastRewind'

function App() {
    const input = useRef(null);
    const endOfMessagesRef = useRef(null);
    const fileInputRef = useRef(null);
    const [messages, setMessages] = useState([]);
    
      
    const [currentOptions, setCurrentOptions] = useState([
        'Task management',
        'Employee support',
        'Banking process assistance',
        'Integration with existing system',
    ]);
    const [chatHistory, setChatHistory] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const handleAudioRecording = () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
        setIsRecording(!isRecording);
    };

    const handleBackClick = () => {
        if (chatHistory.length > 0) {
            const previousState = chatHistory[chatHistory.length - 1];
            setMessages(previousState.messages);
            setCurrentOptions(previousState.currentOptions);
            setChatHistory((prevHistory) => prevHistory.slice(0, -1));
            
        } else {
            console.log("No previous state to go back to.");
        }
        
    };
    
    const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
    const [isCheckingBalance, setIsCheckingBalance] = useState(false);
    const [isApplyingForLoan, setIsApplyingForLoan] = useState(false); 
    const [leaveRequest, setLeaveRequest] = useState({
        employeeId: '',
        leaveType: '',
        startDate: '',
        endDate: '',
    });
    const [itTicket, setItTicket] = useState({
        subject: '',
        description: '',
        impactDetails: '',
        resolutionContent: '',
        name: '',
    });
    const [loanApplication, setLoanApplication] = useState({
        loanId: '',
        group: 'Staff Development', // Static value as per your requirement
        loanCategory: 'ABCD', // Static value as per your requirement
        reason: '',
        loanAmount: '',
        startDate: '2024-09-01',
        endDate:  '2025-09-01',
        status: 'Pending', // Static value as per your requirement
        interestRate: 5.0, // Static value as per your requirement
        loanTerm: '', // To be selected by user
        staff: {
            name: '', // Static value as per your requirement
            staffId: '', // Static value as per your requirement
            department: 'Human Resources' // Static value as per your requirement
        }
        
        
          
    });

    const [selectedLeaveType, setSelectedLeaveType] = useState('');
    const [datesSelected, setDatesSelected] = useState(false);
    const leaveTypes = ['Annual', 'Sick', 'Maternity', 'Special', 'Casual'];

    const handleCameraClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async(event) => {
        const file = event.target.files[0];
        if (file) {
            const fileType = file.type || 'unknown type';
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: `File selected: ${file.name} (${fileType})`, sender: 'human-message' },
            ]);
        }
    };

    const handleInput = () => {
        const inputValue = input.current.value.trim();
        if (!inputValue) return;
        setCurrentOptions([]);
        

        

        setMessages((prevMessages) => [...prevMessages, { text: inputValue, sender: 'human-message' }]);
        input.current.value = '';
        endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });

        if (isApplyingForLoan) {
            handleLoanApplicationInput(inputValue);
        } else if (isSubmittingLeave) {
            handleLeaveRequestInput(inputValue);
        } else if (isCheckingBalance) {
            handleLeaveBalanceCheck(inputValue);
        } else {
            handleItTicketInput(inputValue);
        }
    };

    const handleOptionClick = async (option) => {
        setChatHistory((prevHistory) => [...prevHistory, { messages, currentOptions }]);
        setMessages((prevMessages) => [...prevMessages, { text: option, sender: 'bot-message' }]);

        switch (option) {
            case 'Employee support':
                setCurrentOptions(['Hr queries', 'IT support', 'Apply for staff loan','Bank policies', 'Training and certification']);
                break;
            case 'Hr queries':
                setCurrentOptions(['Check leave balances', 'Submit leave request', 'Access payroll', 'View employee benefits']);
                break;
            case 'IT support':
                setCurrentOptions(['Log IT tickets', 'Provide troubleshooting tips', 'Access FAQs for common IT problems', ]);
                break;
            case 'Bank policies':
                setCurrentOptions(['Compliance Policies', 'AML (Anti-Money Laundering) Policies','Cybersecurity Policies','General Bank Policies', ]);
                break;

            case 'Compliance Policies':
                await retrieveDocument()
                setCurrentOptions([])
                break

            case 'Apply for staff loan': 
                setCurrentOptions([]);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: 'What is your reason for applying for a loan:', sender: 'bot' },
                ]);
                setIsApplyingForLoan(true);
                break;
            case 'Log IT tickets':
                setCurrentOptions([]);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: 'Please provide the subject of the issue:', sender: 'bot' },
                ]);
                break;
            case 'General Bank Policies':
                setCurrentOptions([])
                setShowReport(true);

                
            case 'Submit leave request':
                setCurrentOptions([]);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: 'Please provide your Employee ID', sender: 'bot' },
                ]);
                setIsSubmittingLeave(true);
                break;
            case 'Check leave balances':
                setCurrentOptions([]);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: 'Please provide your Employee ID to retrieve your leave balances.', sender: 'bot' },
                ]);
                setIsCheckingBalance(true);
                break;
            default:
                setCurrentOptions(['Task management', 'Employee support', 'Banking process assistance', 'Integration with existing systems']);
        }
        endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    };
    const retrieveDocument = async () => {
        try {
            const response = await axios.get('http://localhost:8060/api/v1/sharepoint/read-files-from-folder', {
                params: { folderName: 'Testing Folder' }
            });
    
            const documents = response.data;
            if (!documents || documents.length === 0) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: 'No documents found in this folder.', sender: 'bot' }
                ]);
                return;
            }
    
            documents.forEach(doc => {
                const documentLink = doc.LinkingUrl;
                const documentName = doc.Name || "Document"; 
    
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: `Retrieved document: ${documentName}`, sender: 'bot' },
                    { text: `You can download it [here](${documentLink}).`, sender: 'bot' }
                ]);
            });
        } catch (error) {
            console.error('Error retrieving documents:', error);
            // Provide more specific error feedback
            if (error.response) {
                // Server responded with a status other than 2xx
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: `Error: ${error.response.status} - ${error.response.data.message || 'An error occurred.'}`, sender: 'bot' }
                ]);
            } else if (error.request) {
                // Request was made but no response received
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: 'Network error. Please check your connection or try again later.', sender: 'bot' }
                ]);
            } else {
                // Something else triggered the error
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: 'An unexpected error occurred. Please try again.', sender: 'bot' }
                ]);
            }
        }
    };
  


    const handleItTicketInput = (inputValue) => {
        if (!itTicket.subject) {
            setItTicket((prev) => ({ ...prev, subject: inputValue }));
            setMessages((prevMessages) => [...prevMessages, { text: 'Please provide the description of the issue:', sender: 'bot' }]);
        } else if (!itTicket.description) {
            setItTicket((prev) => ({ ...prev, description: inputValue }));
            setMessages((prevMessages) => [...prevMessages, { text: 'Please provide the impact details:', sender: 'bot' }]);
        } else if (!itTicket.impactDetails) {
            setItTicket((prev) => ({ ...prev, impactDetails: inputValue }));
            setMessages((prevMessages) => [...prevMessages, { text: 'Please provide the resolution content:', sender: 'bot' }]);
        } else if (!itTicket.resolutionContent) {
            setItTicket((prev) => ({ ...prev, resolutionContent: inputValue }));

            setMessages((prevMessages) => [...prevMessages, { text: 'Submitting your IT ticket...', sender: 'bot' }]);
            submitItTickets();
            setItTicket({ name: '', subject: '', description: '', impactDetails: '', resolutionContent: '' });
        }
    };

    const handleLeaveRequestInput = (inputValue) => {
        if (!leaveRequest.employeeId) {
            setLeaveRequest((prev) => ({ ...prev, employeeId: inputValue }));
            setMessages((prevMessages) => [...prevMessages, { text: 'Please select your leave type:', sender: 'bot' }]);
        } else if (!leaveRequest.leaveType) {
            setMessages((prevMessages) => [...prevMessages, { text: 'Please select your leave type:', sender: 'bot' }]);
        } else if (!datesSelected) {
            // Waiting for date selection
        }else {
          submitLeaveRequest();
        }
           
        
    };

    const handleLeaveBalanceCheck = (employeeId) => {
        setMessages((prevMessages) => [...prevMessages, { text: 'Fetching leave balance...', sender: 'bot' }]);

        setTimeout(() => {
            const leaveBalances = {
                'Annual Leave': 10,
                'Sick Leave': 5,
                'Maternity Leave': 15,
                'Unpaid Leave': 2,
            };

            setMessages((prevMessages) => [
                ...prevMessages,
                { text: `Leave balances for Employee ID ${employeeId}:`, sender: 'bot' },
                { text: `Annual Leave: ${leaveBalances['Annual Leave']} days`, sender: 'bot' },
                { text: `Sick Leave: ${leaveBalances['Sick Leave']} days`, sender: 'bot' },
                { text: `Maternity Leave: ${leaveBalances['Maternity Leave']} days`, sender: 'bot' },
                { text: `Casual: ${leaveBalances['Unpaid Leave']} days`, sender: 'bot' },
            ]);

            setIsCheckingBalance(false);
        }, 1000);
    };

    const submitLeaveRequest = () => {
        console.log("Submitting Leave Request:", leaveRequest); // Log the leaveRequest
    
        // Validate required fields
        if (!leaveRequest.employeeId || !leaveRequest.leaveType || !leaveRequest.startDate || !leaveRequest.endDate) {
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: 'Please fill in all required fields before submitting your leave request.', sender: 'bot' },
            ]);
            return; 
        }
    
        const leaveRequestPayload = {
            employeeId: "66eaf141b2d2c3c0b2da7878", // Use the employee ID from state
            startDate: new Date(leaveRequest.startDate).toISOString(),
            endDate: new Date(leaveRequest.endDate).toISOString(),
            type: leaveRequest.leaveType,
            reason: "Family vacation", // This can be dynamic
        };
        console.log("Payload being sent:", JSON.stringify(leaveRequestPayload, null, 2));
    
        axios.post('http://localhost:3001/api/leave-requests/apply-leave', leaveRequestPayload)
            .then((response) => {
                console.log("Response from server:", response.data); // Log the full response for debugging
                
                // Check if the response has an _id field or if status is 'Pending'
                if (response.data && response.data._id) { // Adjust based on actual response format
                    console.log("Leave request submitted successfully."); // Log success message
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { text: 'Leave request submitted successfully!', sender: 'bot' },
                    ]);
                } else {
                    console.log("Error submitting leave request."); // Log error message
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { text: 'There was an error submitting your leave request. Please try again.', sender: 'bot' },
                    ]);
                }
            })
            .catch((error) => {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: 'There was an error submitting your leave request. Please try again.', sender: 'bot' },
                ]);
                console.error('Error submitting leave request:', error);
            })
            .finally(() => {
                // Reset the leave request state after submission
                setLeaveRequest({
                    employeeId: '',
                    leaveType: '',
                    startDate: '',
                    endDate: '',
                });
                setDatesSelected(false); // Reset dates selection state
                setIsSubmittingLeave(false); // Reset submission state
            });
    };

    const handleCheckboxChange = (leaveType) => {
        setSelectedLeaveType(leaveType);
    };

    const handleSendCheckboxSelection = () => {
        if (selectedLeaveType) {
            setLeaveRequest((prev) => ({ ...prev, leaveType: selectedLeaveType }));
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: `You have selected: ${selectedLeaveType}`, sender: 'bot' },
                { text: 'Please select the start and end dates for your leave:', sender: 'bot' },
            ]);
            setSelectedLeaveType('');
        }
    };

    const submitItTickets = () => {
        const ticketData = {
            "request": {
                "subject": itTicket.subject,
                "description": itTicket.description,
                "impactDetails": itTicket.impactDetails,
                "resolution": {
                    "content": 'gfhfjf',
                },
                "status": {
                    "name": "Open",
                },
            }
        };
        console.log("Submitting Ticket Data:", ticketData);
        axios.post('http://localhost:8080/api/create-ticket', ticketData)
            .then((response) => {
                if (response.data.response_status && response.data.response_status.status === 'success') {
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { text: 'IT ticket submitted successfully!', sender: 'bot' },
                    ]);
                } else {
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { text: 'There was an error submitting your IT ticket. Please try again.', sender: 'bot' },
                    ]);
                }
            })
            .catch((error) => {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: 'There was an error submitting your IT ticket. Please try again.', sender: 'bot' },
                ]);
                console.error('Error submitting IT ticket:', error);
            });
    };
    const handleLoanApplicationInput = (inputValue) => {
        if (!loanApplication.reason) {
            setLoanApplication((prev) => ({ ...prev, reason: inputValue }));
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: 'Please provide the loan amount:', sender: 'bot' },
            ]);
        } else if (!loanApplication.loanAmount) {
            setLoanApplication((prev) => ({ ...prev, loanAmount: inputValue }));
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: 'Please provide your loan category:', sender: 'bot' },
            ]);
        
        } else if (!loanApplication.loanCategory) {
            setLoanApplication((prev) => ({ ...prev, staff: { ...prev, loanCategory: inputValue } }));
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: 'Please provide the loan term (in months):', sender: 'bot' },
            ]);
        } else if (!loanApplication.loanTerm) {
            // Ensure the loanTerm is a valid number
            const term = parseInt(inputValue);
            if (!isNaN(term)) {
                setLoanApplication((prev) => ({ ...prev, loanTerm: term }));
                submitLoanApplication();
            } else {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: 'Please provide a valid number for the loan term:', sender: 'bot' },
                ]);
            }
        }
    };
    const submitLoanApplication = () => {
        const newLoanId = `L${Date.now()}`; // Generate a unique loan ID
    
        const loanPayload = {
            loanId: newLoanId,
            group: loanApplication.group,
            loanCategory: loanApplication.loanCategory,
            reason: loanApplication.reason,
            loanAmount: parseFloat(loanApplication.loanAmount),
            startDate: loanApplication.startDate,
            endDate: loanApplication.endDate,
            status: loanApplication.status,
            interestRate: loanApplication.interestRate,
            loanTerm: loanApplication.loanTerm, // This should now be a valid number
            staff: loanApplication.staff,
        };
    
        console.log('Loan Payload:', loanPayload); // Log the payload
    
        axios.post('http://127.0.0.1:3001/api/loans/create', loanPayload)
            .then((response) => {
                if (response.data && response.data._id) {
                    console.log("Loan application submitted successfully.");
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { text: 'Loan application submitted successfully!', sender: 'bot' },
                    ]);
                } else {
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { text: 'There was an error submitting your loan application. Please try again.', sender: 'bot' },
                    ]);
                }
            })
            .catch((error) => {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: 'There was an error submitting your loan application. Please try again.', sender: 'bot' },
                ]);
                console.error('Error submitting loan application:', error);
            })
            .finally(() => {
                // Reset loan application state after submission
                setLoanApplication({
                    loanId: '',
                    group: 'Staff Development',
                    loanCategory: 'ABCD',
                    reason: '',
                    loanAmount: '',
                    startDate: '2024-09-01',
                    endDate: '2025-09-01',
                    status: 'Pending',
                    interestRate: 5.0,
                    loanTerm: '',
                    staff: {
                        name: '',
                        staffId: '',
                        department: 'Human Resources'
                    }
                });
                setIsApplyingForLoan(false); // Reset loan application state
            });
    };
    const handleStartDateChange = (startDate) => {
      setLeaveRequest((prev) => ({ ...prev, startDate }));
      if (leaveRequest.endDate) {
          showCombinedDateMessage(startDate, leaveRequest.endDate);
      }
  };

  const handleEndDateChange = (endDate) => {
      setLeaveRequest((prev) => ({ ...prev, endDate }));
      if (leaveRequest.startDate) {
          showCombinedDateMessage(leaveRequest.startDate, endDate);
      }
  };

    const showCombinedDateMessage = (startDate, endDate) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { text: `Start Date - ${startDate}, End Date - ${endDate}.`, sender: 'bot' },
        ]);
        setDatesSelected(true);

        setTimeout(() => {
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: 'Please provide your email for confirmation:', sender: 'bot' },
            ]);
        }, 300);
    };

    return (
        <div className="App">
            <div className="wrapper">
                <div className="content">
                    <div className="header">
                        
                        <div className="image">
                            <img src='/src/img/cbz_old.png' alt='CBZ Logo' />
                        </div>
                        <div className="name">Engage-Chat</div>
                    </div>
                    <div className="main">
                           {/* Render Back Icon when there are options and it's not the default options */}
                    {currentOptions.length > 0 && 
                    !(currentOptions.length === 4 &&
                        currentOptions.every((option, index) => option === ['Task management', 'Employee support', 'Banking process assistance', 'Integration with existing system'][index])
                        ) && (
                        
                        <div className="back-icon">
                            <FastRewindIcon 
                                onClick={handleBackClick} 
                                style={{ cursor: 'pointer', marginRight: '10px', color: '#1A1A56', fontSize: '40px' }} 
                            />
            
            </div>
)}                        <div className="messages">
                            {messages.map((msg, index) => (
                                <div key={index} className={msg.sender === 'human-message' ? 'human-message' : 'bot-message'}>
                                    {msg.text}
                                </div>
                            ))}
                        </div>
                      
        

                        {isSubmittingLeave && leaveRequest.employeeId && !leaveRequest.leaveType && (
                            <div className="leave-type-selection">
                                {leaveTypes.map((leaveType) => (
                                    <div key={leaveType}>
                                        <input
                                            type="radio"
                                            id={leaveType}
                                            name="leaveType"
                                            value={leaveType}
                                            checked={selectedLeaveType === leaveType}
                                            onChange={() => handleCheckboxChange(leaveType)}
                                        />
                                        <label htmlFor={leaveType}>{leaveType}</label>
                                    </div>
                                ))}
                            </div>
                        )}
                        {isSubmittingLeave && leaveRequest.leaveType && !datesSelected && (
                            <div className="date-selection">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    onChange={(e) => handleStartDateChange(e.target.value)}
                                />
                                <label>End Date</label>
                                <input
                                    type="date"
                                    onChange={(e) => handleEndDateChange(e.target.value)}
                                />
                            </div>
                        )}<div className="options-container">
                        
                        
                        <div className="options">
                        
                            

                            {currentOptions.map((option, index) => (
                                <button key={index} onClick={() => handleOptionClick(option)}>{option}</button>
                            ))}
                        </div>
                    </div>
                    <div ref={endOfMessagesRef} />
                </div>
                <div className="bottom">
                    <div className="input">
                        <input type="text" placeholder="Type your message here" ref={input}/>
                        <MicIcon 
                            onClick={handleAudioRecording} 
                            style={{ cursor: 'pointer', marginLeft: '10px', color: isRecording ? 'red' : '#1A1A56', fontSize: '35px' }} 
                        />
                        <CameraAltIcon 
                            onClick={handleCameraClick} 
                            style={{ cursor: 'pointer', marginLeft: '10px', color: '#1A1A56', fontSize: '35px' }} 
                        />
                        
                        <input
                            type="file"
                            accept="*/*"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="btn">
                        <button onClick={() => { handleInput(); handleSendCheckboxSelection(); }}>
                            <i className="fas fa-paper-plane"></i> Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default App;