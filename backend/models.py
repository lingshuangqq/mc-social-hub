from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship, backref
from sqlalchemy.sql import func
from database import Base

class UserFollow(Base):
    __tablename__ = "user_follows"
    follower_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    followed_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id")) # Receiver
    sender_id = Column(Integer, ForeignKey("users.id")) # Triggered by
    type = Column(String) # 'like', 'comment', 'follow'
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])
    sender = relationship("User", foreign_keys=[sender_id])
    post = relationship("Post")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    avatar_url = Column(String)
    google_sub = Column(String, unique=True, index=True)
    bio = Column(String, nullable=True)
    title = Column(String, nullable=True)
    location = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    followers = relationship(
        "User", 
        secondary="user_follows",
        primaryjoin="User.id==UserFollow.followed_id",
        secondaryjoin="User.id==UserFollow.follower_id",
        backref="following"
    )

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    content = Column(Text)
    images = Column(JSON) # List of URLs
    ai_keywords = Column(Text, nullable=True) # AI generated keywords/description from images
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    author = relationship("User")
    comments = relationship("Comment", back_populates="post", order_by="asc(Comment.created_at)")

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True)
    content = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    post = relationship("Post", back_populates="comments")
    author = relationship("User")
    replies = relationship("Comment", backref=backref('parent', remote_side=[id]))

class AllowedEmail(Base):
    __tablename__ = "allowed_emails"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True) # Optional: from HR data
    department = Column(String, nullable=True) # Optional
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class PostLike(Base):
    __tablename__ = "post_likes"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.id"), primary_key=True)

class PostCollection(Base):
    __tablename__ = "post_collections"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.id"), primary_key=True)