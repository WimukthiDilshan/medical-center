import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const SignatureManager = ({ onSignatureUpdated }) => {
  const [signature, setSignature] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showDrawPad, setShowDrawPad] = useState(false);
  const canvasRef = useRef(null);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchSignature();
  }, []);

  const fetchSignature = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/signature', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSignature(response.data.signature);
    } catch (error) {
      console.error('Failed to fetch signature:', error);
    }
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setLastPosition({ x, y });
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();

    setLastPosition({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL('image/png');

    try {
      await axios.post(
        'http://localhost:8000/api/signature',
        { signature: signatureData },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSignature(signatureData);
      setShowDrawPad(false);
      alert('Signature saved successfully!');
      if (onSignatureUpdated) onSignatureUpdated();
    } catch (error) {
      console.error('Failed to save signature:', error);
      alert('Failed to save signature');
    }
  };

  const deleteSignature = async () => {
    if (!confirm('Are you sure you want to delete your signature?')) return;

    try {
      await axios.delete('http://localhost:8000/api/signature', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSignature(null);
      alert('Signature deleted successfully!');
      if (onSignatureUpdated) onSignatureUpdated();
    } catch (error) {
      console.error('Failed to delete signature:', error);
      alert('Failed to delete signature');
    }
  };

  const uploadSignatureImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target.result;

      try {
        await axios.post(
          'http://localhost:8000/api/signature',
          { signature: imageData },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setSignature(imageData);
        alert('Signature uploaded successfully!');
        if (onSignatureUpdated) onSignatureUpdated();
      } catch (error) {
        console.error('Failed to upload signature:', error);
        alert('Failed to upload signature');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <h3 style={{ marginBottom: '15px', color: '#333' }}>E-Signature Management</h3>
      
      {signature ? (
        <div>
          <div style={{ border: '2px solid #28a745', padding: '10px', borderRadius: '5px', backgroundColor: 'white', marginBottom: '15px' }}>
            <p style={{ margin: '0 0 10px 0', color: '#28a745', fontWeight: 'bold' }}>✓ Signature on file</p>
            <img src={signature} alt="Your Signature" style={{ maxWidth: '300px', maxHeight: '100px', border: '1px solid #ddd' }} />
          </div>
          <button 
            onClick={deleteSignature}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Delete Signature
          </button>
          <button 
            onClick={() => setShowDrawPad(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Update Signature
          </button>
        </div>
      ) : (
        <div>
          <p style={{ marginBottom: '15px', color: '#666' }}>No signature on file. Add your signature:</p>
          <button 
            onClick={() => setShowDrawPad(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Draw Signature
          </button>
          <label 
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'inline-block'
            }}
          >
            Upload Image
            <input 
              type="file" 
              accept="image/*" 
              onChange={uploadSignatureImage}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      )}

      {showDrawPad && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '600px',
            width: '90%'
          }}>
            <h4 style={{ marginBottom: '15px' }}>Draw Your Signature</h4>
            <canvas
              ref={canvasRef}
              width={500}
              height={150}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              style={{
                border: '2px solid #007bff',
                borderRadius: '5px',
                cursor: 'crosshair',
                backgroundColor: 'white',
                display: 'block',
                marginBottom: '15px'
              }}
            />
            <div>
              <button 
                onClick={clearCanvas}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ffc107',
                  color: '#000',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                Clear
              </button>
              <button 
                onClick={saveSignature}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                Save Signature
              </button>
              <button 
                onClick={() => setShowDrawPad(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignatureManager;
