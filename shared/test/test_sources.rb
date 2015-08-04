require 'minitest/autorun'
require 'rack/test'
require File.expand_path '../../../deployment', __FILE__
require File.expand_path '../../middleware/assets_api', __FILE__
require File.expand_path '../../middleware/channels_api', __FILE__

ENV['RACK_ENV'] = 'test'

class SourcesTest < Minitest::Unit::TestCase

  def setup
    # The Sources API does not *currently* need to share a cookie jar with the Channels API,
    # but it may once we restrict put, delete and list operations to the channel owner.
    @channels = Rack::Test::Session.new(Rack::MockSession.new(ChannelsApi, 'studio.code.org'))
    @files = Rack::Test::Session.new(Rack::MockSession.new(AssetsApi, 'studio.code.org'))
  end

  def test_assets
    @channels.post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel = @channels.last_response.location.split('/').last

    # Upload a source file.
    filename = 'test.js'
    file_data = 'abc 123'
    @files.put "/v3/sources/#{channel}/#{filename}", file_data, 'CONTENT_TYPE' => 'text/javascript'
    assert @files.last_response.successful?

    # Overwrite it.
    new_file_data = 'def 456'
    @files.put "/v3/sources/#{channel}/#{filename}", new_file_data, 'CONTENT_TYPE' => 'text/javascript'
    assert @files.last_response.successful?

    # Delete it.
    @files.delete "/v3/sources/#{channel}/#{filename}"
    assert @files.last_response.successful?

    # List versions.
    @files.get "/v3/sources/#{channel}/#{filename}/versions"
    assert @files.last_response.successful?
    versions = JSON.parse(@files.last_response.body)
    assert_equal 2, versions.count
  end
end
