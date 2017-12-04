/* global dashboard */

import $ from 'jquery';

/**
 * Dynamic generation and event bindings for project admin section of the admin box
 */
export default () => {
  if ($('.project_admin').length) {
    if (dashboard.project.isProjectLevel()) {
      if (dashboard.project.isFrozen()) {
        $('.project_admin').html($('<span>&#x2744; Frozen! To use as an example, copy this id: <input type="text" disabled value="' +
          dashboard.project.getCurrentId() +
          '"/></span>'));
      } else {
        $('.project_admin').html($('<button id="freeze" class="btn btn-default btn-sm">Freeze for use as an exemplar &#x2744;</button>'));
        $('#freeze').click(function () {
          dashboard.project.freeze(function () {
            window.location.reload();
          });
        });
      }
    }
  }

  if ($('.feature_project').length) {
    if (dashboard.project.isProjectLevel()) {
      console.log("project", dashboard.project);
      var featured = false;
      //FeaturedProject.where(project_id: dashboard.project.getCurrentId()).exists?

      // storage_decrypt_channel_id(dashboard.project.getCurrentId())

      if (featured) {
        $('.feature_project').html($('<button id="feature" class="btn btn-default btn-sm">Stop featuring in gallery</button>'));
      } else {
        $('.feature_project').html($('<button id="feature" class="btn btn-default btn-sm">Feature in gallery</button>'));
      }
    }
  }

  if ($('.admin-abuse').length && dashboard.project.isProjectLevel()) {
    var abuseScore = dashboard.project.getAbuseScore();
    if (abuseScore) {
      $('.admin-abuse').show();
      $('.admin-abuse-score').text(abuseScore);
      $('.admin-abuse-reset').click(function () {
        dashboard.project.adminResetAbuseScore();
      });
    } else {
      $('.admin-report-abuse').show();
    }
  }
};
