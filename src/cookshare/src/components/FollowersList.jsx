import React from 'react';
import { Link } from 'react-router-dom';
import FollowButton from './FollowButton';
import './FollowersList.css';

export default function FollowersList({ items = [], total = 0, onLoadMore, currentUserId }) {
  return (
    <div className="followers-list-component">
      {items.length === 0 ? (
        <div className="empty">Chưa có người theo dõi</div>
      ) : (
        <ul>
          {items.map(u => (
            <li key={u.id} className="user-row">
              <div className="user-left">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt={u.username} className="follower-avatar" />
                ) : (
                  <div className="follower-placeholder">{(u.username || 'U').charAt(0).toUpperCase()}</div>
                )}
                <Link to={`/user/${u.id}`} className="user-link">{u.username}</Link>
              </div>
              <div className="user-actions">
                {currentUserId && currentUserId !== u.id && <FollowButton userId={u.id} />}
              </div>
            </li>
          ))}
        </ul>
      )}
      {items.length < total && onLoadMore && (
        <button className="btn-load" onClick={onLoadMore}>Xem thêm</button>
      )}
    </div>
  );
}
