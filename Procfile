web: bundle exec puma -C config/puma.rb
worker: bundle exec sidekiq -q default -q mailers -t 25 -C config/sidekiq.yml
client: sh -c 'rm app/assets/webpack/* || true && cd client && bundle exec rake react_on_rails:locale && npm run build:production'
