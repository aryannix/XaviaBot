{ pkgs }: {
	deps = [
   pkgs.pixman
   pkgs.python3
   pkgs.librsvg
   pkgs.giflib
   pkgs.libjpeg
   pkgs.pango
   pkgs.cairo
   pkgs.pkg-config
        pkgs.libuuid
    ];
  	env = { LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [pkgs.libuuid]; };
}
