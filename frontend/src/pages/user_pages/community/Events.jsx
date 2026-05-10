import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import UserCommunityNav from '../../../components/UserCommunityNav';
import Footer from '../../../components/Footer';

const PageWrapper = styled.div`
  background: linear-gradient(135deg, #f2f2f2 0%, #8DF2E8 100%);
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  padding-bottom: 50px;
`;

const ContentContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 30px;
  border-radius: 30px;
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const EventList = styled.div`
  max-height: 500px;
  overflow-y: auto;
  padding-right: 10px;
`;

const EventItem = styled.div`
  background: white;
  padding: 15px;
  border-radius: 15px;
  margin-bottom: 15px;
  border-left: 5px solid #3CCFC4;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);

  h4 { margin: 0 0 5px 0; color: #333; }
  p { margin: 0; font-size: 13px; color: #666; }
  .date-label { font-size: 11px; font-weight: bold; color: #3CCFC4; }
`;

const CalendarWrapper = styled.div`
  .react-calendar {
    border: none;
    border-radius: 20px;
    font-family: 'Poppins', sans-serif;
    width: 100%;
    padding: 10px;
  }
  .highlight {
    background: #3CCFC4 !important;
    color: white !important;
    border-radius: 50%;
  }
`;

const Events = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventPosts();
  }, []);

  const fetchEventPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://127.0.0.1:8000/api/posts/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const eventPosts = res.data.filter(post =>
        post.post_type && post.post_type.toLowerCase() === 'event'
      );

      setEvents(eventPosts);
      runFilter(new Date(), eventPosts);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const runFilter = (date, allEvents = events) => {
    const searchDate = date.toISOString().split('T')[0];

    const selected = allEvents.filter(event => {
      const eventDateStr = new Date(event.created_at || event.timestamp).toISOString().split('T')[0];
      return eventDateStr === searchDate;
    });

    setFilteredEvents(selected);
  };

  const onDateChange = (date) => {
    setSelectedDate(date);
    runFilter(date);
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const tileDate = date.toISOString().split('T')[0];
      const hasEvent = events.some(e => {
        const eDate = new Date(e.created_at || e.timestamp).toISOString().split('T')[0];
        return eDate === tileDate;
      });
      return hasEvent ? 'highlight' : null;
    }
  };

  return (
    <>
      <UserCommunityNav />
      <PageWrapper>
        <ContentContainer>
          {/* LEFT: CALENDAR */}
          <GlassCard>
            <h2 style={{ marginBottom: '20px' }}>Community Calendar</h2>
            <CalendarWrapper>
              <Calendar
                onChange={onDateChange}
                value={selectedDate}
                tileClassName={tileClassName}
              />
            </CalendarWrapper>
            <p style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
              * Dates highlighted in teal have active community events.
            </p>
          </GlassCard>

          {/* RIGHT: EVENT DETAILS */}
          <GlassCard>
            <h3 style={{ marginBottom: '20px' }}>
              Events for {selectedDate.toLocaleDateString()}
            </h3>
            <EventList>
              {loading ? (
                <p>Loading events...</p>
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map(event => (
                  <EventItem key={event.id}>
                    <span className="date-label">{event.post_type.toUpperCase()}</span>
                    <h4>{event.title}</h4>
                    <p>{event.description}</p>
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
                      By @{event.author_username}
                    </div>
                  </EventItem>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#999', marginTop: '50px' }}>
                  <p>No events scheduled for this day.</p>
                </div>
              )}
            </EventList>
          </GlassCard>
        </ContentContainer>
      </PageWrapper>
      <Footer />
    </>
  );
};

export default Events;
