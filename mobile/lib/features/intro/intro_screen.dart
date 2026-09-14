import 'dart:async';
import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

/// Full-screen cinematic AgriMark Intro Screen for Flutter.
///
/// Features:
/// - Muted, autoplay, plays exactly once
/// - Zero playback controls, zero skip button
/// - Automatically transitions on video completion to main app/login
/// - Fallback branding screen & 10s safety timeout if video fails
/// - Clean controller disposal and AppLifecycle handling to prevent memory leaks
class AgriMarkIntroScreen extends StatefulWidget {
  final VoidCallback onIntroComplete;

  const AgriMarkIntroScreen({super.key, required this.onIntroComplete});

  @override
  State<AgriMarkIntroScreen> createState() => _AgriMarkIntroScreenState();
}

class _AgriMarkIntroScreenState extends State<AgriMarkIntroScreen>
    with WidgetsBindingObserver {
  VideoPlayerController? _controller;
  bool _isInitialized = false;
  bool _isFinished = false;
  bool _hasError = false;
  Timer? _safetyTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initializeVideo();
    _startSafetyTimer();
  }

  void _startSafetyTimer() {
    // 10-second safety net timer to ensure app never gets stuck
    _safetyTimer = Timer(const Duration(seconds: 10), () {
      _finishIntro();
    });
  }

  Future<void> _initializeVideo() async {
    try {
      final controller = VideoPlayerController.asset(
        'assets/videos/Cinematic_second_logo_reve.mp4',
      );
      _controller = controller;

      await controller.initialize();
      await controller.setVolume(0.0); // Muted / autoplay-safe
      await controller.setLooping(false);

      controller.addListener(_videoListener);

      if (mounted) {
        setState(() {
          _isInitialized = true;
        });
        await controller.play();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _hasError = true;
        });
      }
      // If initialization fails, finish intro safely after brief fallback display
      Future.delayed(const Duration(seconds: 2), () {
        _finishIntro();
      });
    }
  }

  void _videoListener() {
    if (_controller == null || _isFinished) return;

    final value = _controller!.value;
    if (value.isInitialized &&
        !value.isPlaying &&
        value.position >= value.duration &&
        value.duration > Duration.zero) {
      _finishIntro();
    }
  }

  void _finishIntro() {
    if (_isFinished) return;
    _isFinished = true;
    _safetyTimer?.cancel();

    if (mounted) {
      widget.onIntroComplete();
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (_controller == null || !_isInitialized) return;

    if (state == AppLifecycleState.paused) {
      _controller?.pause();
    } else if (state == AppLifecycleState.resumed && !_isFinished) {
      _controller?.play();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _safetyTimer?.cancel();
    _controller?.removeListener(_videoListener);
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0F0D),
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Fallback Branded Poster Screen (Visible if loading or on error)
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0xFF0A0F0D), Color(0xFF121A16), Color(0xFF0A0F0D)],
              ),
            ),
            child: const Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.eco_rounded,
                  size: 64,
                  color: Color(0xFF10B981),
                ),
                SizedBox(height: 16),
                Text(
                  'AgriMark',
                  style: TextStyle(
                    fontSize: 40,
                    fontWeight: FontWeight.extrabold,
                    color: Color(0xFF10B981),
                    letterSpacing: 1.2,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  'From Farm to Market.',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF9CA3AF),
                  ),
                ),
              ],
            ),
          ),

          // Video Player Layer (Fills entire screen without stretching)
          if (_isInitialized && _controller != null && !_hasError)
            SizedBox.expand(
              child: FittedBox(
                fit: BoxFit.cover,
                child: SizedBox(
                  width: _controller!.value.size.width > 0
                      ? _controller!.value.size.width
                      : 1080,
                  height: _controller!.value.size.height > 0
                      ? _controller!.value.size.height
                      : 1920,
                  child: VideoPlayer(_controller!),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
