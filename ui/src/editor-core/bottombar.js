// Load templates
const bottomBarViewerTemplate = require('../templates/bottombar-viewer.hbs');

/**
 * Bottom topbar contructor
 * @param {object} parent - Parent object
 * @param {object} container - the container to render the bottombar to
 */
const Bottombar = function(parent, container) {
  this.parent = parent;
  this.DOMObject = container;
};

/**
 * Render bottombar
 * @param {object} element - the element to render the bottombar to
 */
Bottombar.prototype.render = function(element) {
  const app = this.parent;
  const readOnlyModeOn =
    (app.readOnlyMode != undefined && app.readOnlyMode === true);

  // Get topbar trans
  const newBottomBarTrans = $.extend(toolbarTrans, topbarTrans);

  const checkHistory = app.checkHistory();
  newBottomBarTrans.undoActiveTitle =
    (checkHistory) ? checkHistory.undoActiveTitle : '';

  // Check if trash bin is active
  const trashBinActive =
    app.selectedObject.isDeletable &&
    (app.readOnlyMode === undefined ||
      app.readOnlyMode === false);

  // Get text for bin tooltip
  newBottomBarTrans.trashBinActiveTitle =
    (trashBinActive) ?
      newBottomBarTrans.deleteObject.replace(
        '%object%',
        app.selectedObject.type,
      ) :
      '';

  if (element.type == 'widget') {
    const parentRegion = lD.getElementByTypeAndId('region', element.regionId);

    // Render widget toolbar
    this.DOMObject.html(bottomBarViewerTemplate(
      {
        regionName: (parentRegion) ? parentRegion.name : '',
        trans: newBottomBarTrans,
        readOnlyModeOn: readOnlyModeOn,
        element: element,
        undoActive: checkHistory.undoActive,
        trashActive: trashBinActive,
      },
    ));
  } else if (element.type == 'layout') {
    // Render layout  toolbar
    this.DOMObject.html(bottomBarViewerTemplate(
      {
        trans: newBottomBarTrans,
        readOnlyModeOn: readOnlyModeOn,
        renderLayout: true,
        element: element,
        undoActive: checkHistory.undoActive,
        trashActive: trashBinActive,
      },
    ));

    // Preview request path
    let requestPath = urlsForApi.layout.preview.url;
    requestPath = requestPath.replace(':id', lD.layout.layoutId);

    // Handle play button ( play or pause )
    this.DOMObject.find('#play-btn').click(function() {
      if (lD.viewer.previewPlaying) {
        this.DOMObject.find('#play-btn i')
          .removeClass('fa-stop-circle')
          .addClass('fa-play-circle')
          .attr('title', bottombarTrans.playPreviewLayout);
        app.viewer.render(true);
      } else {
        lD.viewer.playPreview(
          requestPath,
          lD.viewer.containerElementDimensions,
        );
        this.DOMObject.find('#play-btn i')
          .removeClass('fa-play-circle')
          .addClass('fa-stop-circle')
          .attr('title', bottombarTrans.stopPreviewLayout);
        lD.viewer.previewPlaying = true;
      }
    }.bind(this));
  } else if (element.type == 'region') {
    // Render region toolbar
    this.DOMObject.html(bottomBarViewerTemplate(
      {
        trans: newBottomBarTrans,
        readOnlyModeOn: readOnlyModeOn,
        element: element,
        undoActive: checkHistory.undoActive,
        trashActive: trashBinActive,
      },
    ));
  }

  // If read only mode is enabled
  if (app.readOnlyMode != undefined && app.readOnlyMode === true) {
    // Create the read only alert message
    const $readOnlyMessage =
      $('<div id="read-only-message" class="alert alert-warning' +
      'text-center navbar-nav" data-container=".editor-bottom-bar"' +
      'data-toggle="tooltip" data-placement="bottom" data-title="' +
      layoutEditorTrans.readOnlyModeMessage +
      '" role="alert"><strong>' + layoutEditorTrans.readOnlyModeTitle +
      '</strong>:&nbsp;' + layoutEditorTrans.readOnlyModeMessage + '</div>');

    // Prepend the element to the bottom toolbar's content
    $readOnlyMessage.insertAfter(this.DOMObject.find('.pull-left'))
      .on('click', lD.checkoutLayout);
  }

  // Button handlers
  this.DOMObject.find('#delete-btn').click(function() {
    if (element.isDeletable) {
      lD.deleteSelectedObject();
    }
  });

  this.DOMObject.find('#undo-btn').click(function() {
    app.undoLastAction();
  });

  this.DOMObject.find('.properties-btn').click(function(e) {
    const buttonData = $(e.target).data();
    element.editPropertyForm(
      buttonData['property'],
      buttonData['propertyType'],
    );
  });
};

/**
 * Show message on play button
 */
Bottombar.prototype.showPlayMessage = function() {
  const self = this;
  const $target = self.DOMObject.find('#play-btn i');

  // Show popover
  $target.popover('show');

  // Destroy popover after some time
  setTimeout(function() {
    $target.popover('dispose');
  }, 4000);
};

module.exports = Bottombar;
