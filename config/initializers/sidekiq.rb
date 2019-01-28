if Rails.env.production?
    Sidekiq.configure_server do |config|
        config.redis = { url: ENV['REDISTOGO_URL'] || ENV['REDIS_URL']}
        Rails.logger = Sidekiq::Logging.logger
    end
    
    Sidekiq.configure_client do |config|
        config.redis = { url: ENV['REDISTOGO_URL'] || ENV['REDIS_URL'], size: 2 }
    end
else
  Sidekiq.configure_server do |config|
      config.redis = { url: ENV['REDISTOGO_URL'] || ENV['REDIS_URL']}
      Rails.logger = Sidekiq::Logging.logger
  end
end