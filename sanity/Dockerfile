# Use official lightweight Nginx Alpine image
FROM nginx:alpine

# Remove default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx server configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static web application assets to Nginx root directory
COPY index.html styles.css game.js puzzle.png /usr/share/nginx/html/

# Expose port 80 to the outside world
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
